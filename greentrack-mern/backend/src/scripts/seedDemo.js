import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Tree from '../models/Tree.js';

const examples = [
  ['Neem', 'Malla Reddy Campus', 'Aarav Sharma', -1, 'alive', 'Fresh leaves; growth looks healthy.'],
  ['Peepal', 'Community Park, Kompally', 'Priya Reddy', -3, 'alive', 'Protected with a tree guard.'],
  ['Gulmohar', 'School Garden, Suchitra', 'Rahul Kumar', -8, 'needs_attention', 'Soil is dry; schedule watering.'],
  ['Jamun', 'Malla Reddy Campus', 'Ananya Rao', -14, 'alive', 'Good growth after monsoon.'],
  ['Banyan', 'Lake Road Green Belt', 'Mohammed Sameer', -25, 'dead', 'Plant did not survive; assessment recorded.'],
  ['Amaltas', 'Community Park, Kompally', 'Priya Reddy', -31, 'unverified', 'Awaiting first follow-up check.'],
  ['Mango', 'School Garden, Suchitra', 'Kiran Nair', -45, 'replaced', 'Replacement sapling planted.'],
  ['Arjuna', 'Malla Reddy Campus', 'Aarav Sharma', -60, 'alive', 'Healthy canopy development.'],
  ['Neem', 'Lake Road Green Belt', 'Sana Fatima', -75, 'needs_attention', 'Leaves are drooping.'],
  ['Tamarind', 'Village Road, Medchal', 'Rahul Kumar', -100, 'alive', 'Survived a dry spell.'],
  ['Ashoka', 'Malla Reddy Campus', 'Ananya Rao', -120, 'alive', 'Growth measured during inspection.'],
  ['Jamun', 'Village Road, Medchal', 'Kiran Nair', -150, 'unverified', 'No follow-up has been recorded.']
];

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const adminEmail = (process.env.DEMO_ADMIN_EMAIL || 'admin@greentrack.demo').toLowerCase();
  const volunteerEmail = (process.env.DEMO_VOLUNTEER_EMAIL || 'volunteer@greentrack.demo').toLowerCase();
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) admin = await User.create({ name: process.env.DEMO_ADMIN_NAME || 'GreenTrack Admin', email: adminEmail, passwordHash: await User.hashPassword(process.env.DEMO_ADMIN_PASSWORD || 'GreenTrack123!'), role: 'admin' });
  let volunteer = await User.findOne({ email: volunteerEmail });
  if (!volunteer) volunteer = await User.create({ name: process.env.DEMO_VOLUNTEER_NAME || 'Demo Volunteer', email: volunteerEmail, passwordHash: await User.hashPassword(process.env.DEMO_VOLUNTEER_PASSWORD || 'Volunteer123!'), role: 'volunteer' });

  if (await Tree.countDocuments() === 0) {
    const base = new Date();
    await Tree.insertMany(examples.map(([species, locationName, plantedBy, daysAgo, status, notes], i) => {
      const plantedAt = new Date(base); plantedAt.setDate(plantedAt.getDate() + daysAgo);
      return { species, locationName, plantedBy, plantedAt, status, notes, createdBy: i % 3 === 0 ? admin._id : volunteer._id, latitude: null, longitude: null };
    }));
  }
  console.log('Demo data is ready.');
  console.log(`Admin: ${adminEmail} / ${process.env.DEMO_ADMIN_PASSWORD || 'GreenTrack123!'}`);
  console.log(`Volunteer: ${volunteerEmail} / ${process.env.DEMO_VOLUNTEER_PASSWORD || 'Volunteer123!'}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
