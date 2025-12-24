# Email Configuration Setup

## SMTP Configuration

The email service uses SMTP for sending emails. Configure the following environment variables:

```bash
# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@filledintalent.com
```

## Gmail Setup

For Gmail SMTP:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `SMTP_PASS`

## Email Templates

The system includes the following email templates:

### 1. Welcome Email
- Sent to new users upon registration
- Includes getting started guide

### 2. Job Application Notification
- Sent to employers when they receive new applications
- Includes applicant details and job information

### 3. Application Status Updates
- Sent to applicants when their application status changes
- Different messages for pending, interviewing, accepted, rejected

### 4. Job Approval Notification
- Sent to employers when their job posting is approved
- Confirms the job is live and visible to job seekers

### 5. Admin Alerts
- Sent to admins for important events (new registrations, etc.)

## API Endpoints

### Send Custom Email
```
POST /api/email
{
  "to": "user@example.com",
  "subject": "Custom Subject",
  "html": "<p>Email content</p>",
  "text": "Plain text version"
}
```

### Send Welcome Email
```
POST /api/email/welcome
{
  "userId": "user_id_here"
}
```

### Send Job Application Notification
```
POST /api/email/job-application
{
  "applicationId": "application_id_here"
}
```

### Send Application Status Update
```
POST /api/email/application-status
{
  "applicationId": "application_id_here",
  "newStatus": "accepted"
}
```

### Send Job Approval Notification
```
POST /api/email/job-approval
{
  "jobId": "job_id_here"
}
```

## Integration Points

The email service integrates with:

1. **User Registration** - Automatic welcome emails
2. **Job Applications** - Notifications to employers
3. **Application Status Changes** - Updates to applicants
4. **Job Approvals** - Confirmation to employers
5. **Admin Alerts** - System notifications

## Error Handling

- Failed emails are logged to console
- API endpoints return appropriate error responses
- Email failures don't break application flow
- Retry logic can be added for critical emails

## Security Considerations

- Never log email content or passwords
- Validate email addresses before sending
- Rate limit email sending to prevent abuse
- Use HTTPS for webhook endpoints if using external services
