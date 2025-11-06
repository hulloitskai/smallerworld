# Activity Coupon Notification Job Plan

## Overview

Create a background job that sends notifications for active activity coupons,
with timezone-aware scheduling to run at 8am in each user's local timezone.

## Requirements Analysis

### 1. Job Functionality

- **Daily execution**: Run once per day at midnight GMT
- **Timezone-aware scheduling**: Schedule individual notifications for 8am in
  each user's timezone
- **Notification logic**: Send notifications only if no notification was created
  for the activity coupon within the last 7 days
- **Active coupon filtering**: Only process coupons that are still active (not
  expired, not redeemed)

### 2. Data Structure Analysis

- **ActivityCoupon**: Has `expires_at`, `redeemed_at`, belongs to `activity` and
  `friend`
- **Activity**: Belongs to `user` (who has timezone)
- **User**: Has `time_zone_name` field for timezone information
- **Notification**: Has `created_at`, belongs to `noticeable` (ActivityCoupon)
  and `recipient` (Friend)
- **Friend**: Receives notifications for activity coupons

### 3. Existing Patterns

- Jobs follow `ApplicationJob` pattern with GoodJob concurrency control
- Cron jobs configured in `config/initializers/good_job.rb`
- Notifications use `Noticeable` concern with `notification_message` method
- Timezone handling via `ActiveSupport::TimeZone.new(time_zone_name)`

## Implementation Plan

### Phase 1: Create the Scheduler Job

**File**: `app/jobs/schedule_activity_coupon_reminder_job.rb`

**Features**:

- Extends `ApplicationJob` with GoodJob concurrency control
- Uses `good_job_control_concurrency_with` to prevent duplicate executions
- Main `perform` method that:
  1. Iterates through all active activity coupons
  2. For each coupon, schedules a reminder job for 8am in the user's timezone

### Phase 2: Create Individual Reminder Job

**File**: `app/jobs/send_activity_coupon_reminder_job.rb`

**Features**:

- Takes an `ActivityCoupon` as parameter
- Checks if notification was created within last 7 days
- Creates notification if none exists in last 7 days
- Uses existing `ActivityCoupon#create_notification!` method

### Phase 3: Add Cron Configuration

**File**: `config/initializers/good_job.rb`

**Changes**:

- Add new cron entry for daily execution at midnight GMT
- Configure to run `ActivityCouponNotificationJob`

### Phase 4: Add Scope and Job Logic

**File**: `app/models/activity_coupon.rb`

**New scope and helper**:

- `without_recent_notification` - Finds activity coupons without notifications
  in last 7 days
- `has_recent_notification?` - Helper method to check if notification was
  created within last 7 days

**File**: `app/jobs/send_activity_coupon_reminder_job.rb`

**Logic**:

- Use the new scope to find coupons that need reminders
- Business logic for when to send notification

## Detailed Implementation

### Job Structure

```ruby
# Scheduler job (runs daily at midnight GMT)
class ScheduleActivityCouponReminderJob < ApplicationJob
  # Concurrency control to prevent duplicate executions
  good_job_control_concurrency_with(
    key: -> { "#{self.class.name}" },
    total_limit: 1,
  )

  def perform
    # Find active coupons, group by user, schedule individual jobs
  end
end

# Individual reminder job (scheduled for 8am in user's timezone)
class SendActivityCouponReminderJob < ApplicationJob
  good_job_control_concurrency_with(
    key: -> { "#{self.class.name}(#{activity_coupon.to_gid})" },
    total_limit: 1,
  )

  def perform(activity_coupon)
    # Check 7-day rule and send notification if needed
  end
end
```

### Timezone Scheduling Logic

```ruby
# For each active coupon without recent notification
ActivityCoupon.active.without_recent_notification.find_each do |coupon|
  user_timezone = coupon.user.time_zone
  user_8am = user_timezone.now.beginning_of_day + 8.hours

  # Schedule individual job for 8am in user's timezone
  SendActivityCouponReminderJob
    .set(wait_until: user_8am)
    .perform_later(coupon)
end
```

### Scope and Notification Logic

```ruby
# In app/models/activity_coupon.rb
scope :without_recent_notification, -> {
  where.not(
    id: joins(:notifications)
      .where("notifications.created_at > ?", 7.days.ago)
      .select(:id)
  )
}

def has_recent_notification?
  notifications.where("created_at > ?", 7.days.ago).exists?
end

# In SendActivityCouponReminderJob#perform
def perform(activity_coupon)
  # Since we're using the scope, we can just create the notification
  activity_coupon.create_notification!
end
```

## Cron Configuration

```ruby
# In config/initializers/good_job.rb
config.cron = {
  # ... existing entries ...
  "activity_coupon_reminders": {
    class: "ScheduleActivityCouponReminderJob",
    description: "Schedule activity coupon reminders for 8am in user timezones",
    cron: "0 0 * * *", # Daily at midnight GMT
  },
}
```

## Testing Strategy

1. **Unit tests** for job logic and helper methods
2. **Integration tests** for timezone scheduling
3. **Manual testing** with different timezones
4. **Monitoring** via GoodJob dashboard

## Considerations

- **Performance**: Batch processing for large numbers of coupons
- **Error handling**: Retry logic for failed notifications
- **Timezone edge cases**: Handle invalid timezones gracefully
- **Monitoring**: Log job execution and notification counts
- **Idempotency**: Ensure jobs can be safely retried

## Files to Create/Modify

1. `app/jobs/schedule_activity_coupon_reminder_job.rb` (new)
2. `app/jobs/send_activity_coupon_reminder_job.rb` (new)
3. `config/initializers/good_job.rb` (modify)
4. `app/models/activity_coupon.rb` (add scope)
5. `test/jobs/schedule_activity_coupon_reminder_job_test.rb` (new)
6. `test/jobs/send_activity_coupon_reminder_job_test.rb` (new)

## Next Steps

1. Review this plan
2. Approve implementation approach
3. Implement files in order
4. Add tests
5. Deploy and monitor
