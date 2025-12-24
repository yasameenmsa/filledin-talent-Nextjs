import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Initialize the email transporter
   */
  private static initializeTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
    return this.transporter;
  }

  /**
   * Send an email
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const transporter = this.initializeTransporter();

      const mailOptions = {
        from: options.from || process.env.FROM_EMAIL || 'noreply@filledintalent.com',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send job application notification to employer
   */
  static async sendJobApplicationNotification(
    employerEmail: string,
    applicantName: string,
    jobTitle: string,
    applicationId: string
  ): Promise<boolean> {
    const template = this.getJobApplicationTemplate(applicantName, jobTitle, applicationId);

    return this.sendEmail({
      to: employerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Send application status update to applicant
   */
  static async sendApplicationStatusUpdate(
    applicantEmail: string,
    jobTitle: string,
    newStatus: string,
    employerName?: string
  ): Promise<boolean> {
    const template = this.getApplicationStatusTemplate(jobTitle, newStatus, employerName);

    return this.sendEmail({
      to: applicantEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Send welcome email to new user
   */
  static async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    userType: 'job_seeker' | 'employer' | 'admin'
  ): Promise<boolean> {
    const template = this.getWelcomeTemplate(userName, userType);

    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Send job approval notification to employer
   */
  static async sendJobApprovalNotification(
    employerEmail: string,
    jobTitle: string,
    jobId: string
  ): Promise<boolean> {
    const template = this.getJobApprovalTemplate(jobTitle, jobId);

    return this.sendEmail({
      to: employerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string,
    userName?: string
  ): Promise<boolean> {
    const template = this.getPasswordResetTemplate(userName || 'User', resetToken);

    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Send admin alert for new registration
   */
  static async sendAdminNewUserAlert(
    adminEmail: string,
    newUserEmail: string,
    userType: string
  ): Promise<boolean> {
    const template = this.getAdminNewUserTemplate(newUserEmail, userType);

    return this.sendEmail({
      to: adminEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Email Templates
  private static getJobApplicationTemplate(applicantName: string, jobTitle: string, applicationId: string): EmailTemplate {
    return {
      subject: `New Application Received: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Job Application Received!</h2>
          <p>Dear Employer,</p>
          <p>You have received a new application for your job posting:</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">${jobTitle}</h3>
            <p><strong>Applicant:</strong> ${applicantName}</p>
            <p><strong>Application ID:</strong> ${applicationId}</p>
          </div>

          <p>Please log in to your dashboard to review the application and contact the candidate.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Application
            </a>
          </div>

          <p>Best regards,<br>FilledIn Talent Team</p>
        </div>
      `,
      text: `New application received for "${jobTitle}" from ${applicantName}. Application ID: ${applicationId}. Please log in to review.`
    };
  }

  private static getApplicationStatusTemplate(jobTitle: string, newStatus: string, employerName?: string): EmailTemplate {
    const statusMessages = {
      'pending': 'Your application is being reviewed',
      'interviews': 'Congratulations! You have been selected for an interview',
      'accepted': 'Congratulations! Your application has been accepted',
      'rejected': 'We regret to inform you that your application was not successful'
    };

    const statusColors = {
      'pending': '#f59e0b',
      'interviews': '#3b82f6',
      'accepted': '#10b981',
      'rejected': '#ef4444'
    };

    return {
      subject: `Application Status Update: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${statusColors[newStatus as keyof typeof statusColors] || '#6b7280'};">Application Status Update</h2>
          <p>Dear Applicant,</p>
          <p>We wanted to update you on your application for:</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">${jobTitle}</h3>
            ${employerName ? `<p><strong>Company:</strong> ${employerName}</p>` : ''}
            <p><strong>Status:</strong> <span style="color: ${statusColors[newStatus as keyof typeof statusColors]}; font-weight: bold;">${statusMessages[newStatus as keyof typeof statusMessages] || newStatus}</span></p>
          </div>

          <p>${statusMessages[newStatus as keyof typeof statusMessages] || `Your application status has been updated to: ${newStatus}`}</p>

          ${newStatus === 'interviews' ? `
            <p>The employer will contact you soon with interview details. Please check your email regularly.</p>
          ` : ''}

          ${newStatus === 'accepted' ? `
            <p>Congratulations! The employer has decided to move forward with your application. They will contact you with next steps.</p>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View My Applications
            </a>
          </div>

          <p>Best regards,<br>FilledIn Talent Team</p>
        </div>
      `,
      text: `Your application status for "${jobTitle}" has been updated to: ${statusMessages[newStatus as keyof typeof statusMessages] || newStatus}`
    };
  }

  private static getWelcomeTemplate(userName: string, userType: string): EmailTemplate {
    const userTypeLabels = {
      'job_seeker': 'Job Seeker',
      'employer': 'Employer',
      'admin': 'Administrator'
    };

    return {
      subject: `Welcome to FilledIn Talent, ${userName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to FilledIn Talent!</h2>
          <p>Dear ${userName},</p>
          <p>Welcome to FilledIn Talent! Your account as a <strong>${userTypeLabels[userType as keyof typeof userTypeLabels] || userType}</strong> has been successfully created.</p>

          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Getting Started</h3>
            <ul style="color: #374151;">
              <li>Complete your profile to increase visibility</li>
              <li>${userType === 'job_seeker' ? 'Browse and apply to job opportunities' : 'Post your first job opening'}</li>
              <li>Set up email notifications for updates</li>
              <li>Explore our resources and tips</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>

          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>FilledIn Talent Team</p>
        </div>
      `,
      text: `Welcome to FilledIn Talent, ${userName}! Your ${userTypeLabels[userType as keyof typeof userTypeLabels] || userType} account has been created successfully. Get started at ${process.env.NEXTAUTH_URL}/dashboard`
    };
  }

  private static getJobApprovalTemplate(jobTitle: string, jobId: string): EmailTemplate {
    return {
      subject: `Job Approved: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Job Approved!</h2>
          <p>Dear Employer,</p>
          <p>Great news! Your job posting has been approved and is now live:</p>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #166534;">${jobTitle}</h3>
            <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Approved & Live</span></p>
          </div>

          <p>Your job is now visible to job seekers and you should start receiving applications soon!</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/jobs/${jobId}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Job Posting
            </a>
          </div>

          <p>Best regards,<br>FilledIn Talent Team</p>
        </div>
      `,
      text: `Your job "${jobTitle}" has been approved and is now live. View it at ${process.env.NEXTAUTH_URL}/jobs/${jobId}`
    };
  }

  private static getPasswordResetTemplate(userName: string, resetToken: string): EmailTemplate {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    return {
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Password Reset Request</h2>
          <p>Dear ${userName},</p>
          <p>You have requested to reset your password. Click the button below to create a new password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>

          <p>For security reasons, please don't share this email with anyone.</p>

          <p>Best regards,<br>FilledIn Talent Team</p>
        </div>
      `,
      text: `Password reset requested. Reset your password at: ${resetUrl}. This link expires in 1 hour.`
    };
  }

  private static getAdminNewUserTemplate(newUserEmail: string, userType: string): EmailTemplate {
    return {
      subject: 'New User Registration Alert',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">New User Registration</h2>
          <p>Admin Alert,</p>
          <p>A new user has registered on the platform:</p>

          <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <p><strong>Email:</strong> ${newUserEmail}</p>
            <p><strong>Type:</strong> ${userType}</p>
            <p><strong>Registered:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p>Please review the user account if necessary.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/admin/users" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Manage Users
            </a>
          </div>

          <p>Best regards,<br>FilledIn Talent System</p>
        </div>
      `,
      text: `New user registered: ${newUserEmail} (${userType}). Review at ${process.env.NEXTAUTH_URL}/admin/users`
    };
  }
}
