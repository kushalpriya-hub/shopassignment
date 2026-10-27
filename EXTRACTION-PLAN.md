# Extraction Plan

## 1. Module Selected: Notifications

I would evaluate the **notifications module** as the first candidate for extraction.

Notifications is a reasonable candidate because orders no longer needs to call the notifications module directly. Instead, orders publishes an `order.placed` event, and notifications subscribes to it. This creates a clearer boundary between placing an order and sending its confirmation.

However, an event-driven boundary does not automatically mean that notifications needs to become a separate service. I would first verify that independent deployment or operational isolation provides enough value to justify the additional complexity.

### Why Notifications?

- It has a clear responsibility: sending order confirmations.
- It reacts to an event rather than being called directly by orders.
- Its failure should not prevent a successfully placed order from remaining successful.
- It is a relatively small candidate for evaluating the cost of extraction.

The signal I would look for is **a demonstrated need for independent deployment or operational isolation**, supported by evidence such as a separate team owning notifications or notification failures affecting the reliability of the main application.

## 2. Data Ownership

Before extracting notifications, I would identify the data it owns and all existing readers and writers.

| Data | Current ownership | Required action |
|---|---|---|
| Notification messages | Notifications module, through its repository | Keep reads and writes behind the notifications API. |
| Orders | Orders module | Notifications should consume order information through the event payload rather than access the orders repository directly. |
| Inventory | Inventory module | Notifications should not access inventory data directly. |
| Charges | Payments module | Notifications should not access payment records directly. |

The current application uses in-memory repositories. Before a real extraction, I would inspect the complete repository implementation and search all modules for direct access to these data structures. The table ownership and access patterns would need to be verified against the actual database schema before proceeding.

## 3. What Changes When Calls Become Network Calls?

In the current modular monolith, modules communicate in-process. After extraction, communication across the service boundary introduces network failures, latency, and independent availability.

### Order confirmation delivery

Today, orders publishes `order.placed`, and notifications handles the event within the application.

If notifications becomes a separate service, it may be unavailable when an order is placed. A simple HTTP request or in-memory event is not sufficient to guarantee eventual delivery.

I would introduce a durable event-delivery mechanism, such as a transactional outbox and message broker, before relying on asynchronous delivery across the service boundary.

### Timeout handling

If the notifications service is unavailable for ten minutes:

1. The order should still be recorded successfully.
2. The `order.placed` event should be stored durably rather than lost.
3. Delivery attempts should be retried with backoff.
4. The notification handler should be idempotent so that retries do not create duplicate confirmations.
5. Failed messages should be monitored, with a dead-letter or recovery process for messages that repeatedly fail.
6. Once notifications becomes available, pending messages should be processed.

A timeout does not prove that a request failed on the receiving side. The service might have processed it even though the response never reached the caller. Therefore, retries must be safe.

I would also define delivery guarantees and monitor the age of the oldest pending notification.

## 4. Extraction Steps

I would follow the five extraction steps from the lecture's Step 15 in order. Before implementation, I would verify the exact names and sequence in the lecture deck.

### Step 1: Establish the baseline

Measure notification volume, latency, failure rate, resource consumption, and the operational impact of notification failures.

**Check before proceeding:** There is evidence that extraction addresses a real problem or provides a measurable benefit.

### Step 2: Establish the boundary

Keep notification data and behavior inside the notifications module. Ensure that other modules interact through public APIs or the `order.placed` event rather than importing private implementation files.

**Check before proceeding:** The boundary checker passes, and no other module directly accesses notification internals.

### Step 3: Make communication safe

Define the event contract, durable delivery, retry behavior, idempotency, timeout handling, and observability required for remote communication.

**Check before proceeding:** Tests demonstrate that temporary unavailability, retries, and duplicate event delivery do not lose or duplicate confirmations.

### Step 4: Extract incrementally

Deploy the notifications implementation separately while preserving the existing order-placement behavior. Use a controlled rollout and verify delivery against the previous implementation where practical.

**Check before proceeding:** Order placement remains reliable, notification delivery is correct, and the new service meets its operational requirements.

### Step 5: Verify and decide

Compare the new architecture with the baseline. Review reliability, latency, resource usage, deployment independence, and operational overhead.

**Check before proceeding:** The measured benefits justify maintaining another independently deployed service.

## 5. Where I Would Stop

I would stop before extraction if the modular boundary is working well, there is no demonstrated need for independent deployment, and the additional infrastructure would create more cost than value.

I would also stop the rollout if orders could be lost, confirmations were duplicated, or notification failures affected order placement.

I would continue only when the evidence demonstrates a meaningful benefit, the event-delivery mechanism is reliable, and the team can operate the additional service safely.

## Conclusion

Notifications is a candidate for extraction, not an automatic choice. The first step is to establish the operational need and verify the module boundary. The decision to create a separate service should follow evidence, not the assumption that microservices are inherently better than a modular monolith.
