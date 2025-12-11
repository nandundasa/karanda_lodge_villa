# Admin Panel Guide

## Access the Admin Panel

1. Navigate to: `http://localhost:3000/admin`
2. Default password: `admin123`

## Features

### 1. Homepage Slides Management
- Upload new images for the homepage slideshow
- Remove existing slides
- Changes appear on the homepage immediately after saving

### 2. Gallery Management
- Upload images to the gallery
- Remove images from the gallery
- All changes reflect on the Gallery page

### 3. Room Availability Calendar
- Select a room from the dropdown
- Click on dates to toggle availability (Green = Available, Red = Booked)
- Save changes to update room availability

## How to Use

### Upload Images
1. Click on the "Upload Image" button
2. Select an image file from your computer
3. The image will be uploaded to the `/public` folder
4. Click "Save Changes" to persist your modifications

### Manage Room Availability
1. Go to "Room Availability" tab
2. Select a room from the dropdown
3. Click on dates to mark them as booked or available
4. Click "Save Availability" to save changes

## Data Storage

All data is stored in JSON files in the `/data` folder:
- `slides.json` - Homepage slideshow images
- `gallery.json` - Gallery images
- `rooms.json` - Room information and availability

## Security Note

For production use, replace the simple password authentication with a proper authentication system (e.g., NextAuth.js, JWT tokens, etc.)
