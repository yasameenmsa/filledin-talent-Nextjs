
import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    type: 'job_alert' | 'application_update' | 'system' | 'message';
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['job_alert', 'application_update', 'system', 'message'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for fetching unread notifications quickly
NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
