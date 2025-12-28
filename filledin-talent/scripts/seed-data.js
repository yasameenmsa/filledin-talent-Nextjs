
const mongoose = require('mongoose');

// Define minimal schemas for the script
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    role: { type: String, required: true },
    name: String
}, { timestamps: true });

const JobSchema = new mongoose.Schema({
    title: String,
    status: String,
}, { timestamps: true });

const ApplicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'pending' },
    cvUrl: String,
    type: String
}, { timestamps: true });

// Models (use existing if compiled, or create new)
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);
const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);

async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI is not set');
        process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4 // Force IPv4
    });
    console.log('Connected.');

    try {
        const userCount = await User.countDocuments();
        console.log(`Users: ${userCount}`);

        const jobCount = await Job.countDocuments();
        console.log(`Jobs: ${jobCount}`);

        const appCount = await Application.countDocuments();
        console.log(`Applications: ${appCount}`);

        const users = await User.find({}, 'name email role');
        console.log(`\nFound ${users.length} users.`);

        for (const user of users) {
            if (user.role === 'job_seeker') {
                const apps = await Application.countDocuments({ applicant: user._id });
                console.log(`Job Seeker: ${user.email} - Apps: ${apps}`);

                if (apps === 0) {
                    console.log(` -> Seeding application for ${user.email}...`);
                    const job = await Job.findOne({ status: 'active' });
                    if (job) {
                        await Application.create({
                            job: job._id,
                            applicant: user._id,
                            cvUrl: 'https://example.com/mock-cv.pdf',
                            status: 'pending',
                            type: 'Full-time'
                        });
                        console.log(' -> Seeded successfully.');
                    } else {
                        console.log(' -> No active jobs to apply to.');
                    }
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

main();
