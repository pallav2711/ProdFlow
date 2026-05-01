# Task Review Fix - Team Lead Review Visibility

## Problem
When developers marked tasks as "Pending Review", team leads couldn't see these review requests in the "All Team Tasks" page. Team leads only saw their own assigned tasks, not tasks from other team members awaiting review.

## Root Cause
The `DashboardContext` was fetching only the current user's tasks via `/api/sprints/my-tasks` and using that data for both `myTasks` and `allTasks`. This meant:
- Developers only saw their own tasks ✓
- Team leads only saw their own tasks ✗ (should see all team tasks)

## Solution Implemented

### 1. Backend Changes

#### New Controller Function (`backend/controllers/sprint.controller.js`)
Added `getAllTeamTasks()` function that:
- Finds all products the user is a member of
- Gets all sprints from those products
- Returns all tasks from those sprints (not just user's own tasks)
- Includes proper population of assignedTo and reviewedBy fields

#### New Route (`backend/routes/sprint.routes.js`)
Added new endpoint:
```javascript
GET /api/sprints/all-tasks
```
This endpoint is accessible to all authenticated users and returns all tasks from their team's products.

### 2. Frontend Changes

#### Updated DashboardContext (`frontend/src/context/DashboardContext.jsx`)
- Added call to `/api/sprints/all-tasks` endpoint
- Now fetches 4 parallel requests instead of 3:
  1. `/sprints` - All sprints
  2. `/products` - All products
  3. `/sprints/my-tasks` - User's own tasks
  4. `/sprints/all-tasks` - **NEW** All team tasks
- Updated pagination state to include `allTasks` pagination
- Updated comments to reflect the new endpoint usage

## How It Works Now

### For Developers:
- "My Tasks" page shows only their assigned tasks
- Can update status to: To Do, In Progress, Pending Review, Blocked
- Cannot mark tasks as "Completed" (must go through review)

### For Team Leads:
- "My Tasks" page shows only their assigned tasks
- "All Team Tasks" page shows **all tasks from all team members**
- Can see tasks with "Pending Review" status from developers
- Can approve (mark as Completed) or reject (send back to In Progress with feedback)
- Can update any task status

## Testing Steps

1. **As a Developer:**
   - Login as a developer
   - Go to "My Tasks"
   - Change a task status to "Pending Review"
   - Verify it shows in your task list

2. **As a Team Lead:**
   - Login as a team lead
   - Go to "All Team Tasks"
   - Verify you can see the developer's task with "Pending Review" status
   - Click "Approve" or "Reject" to review the task
   - Verify the task status updates correctly

3. **Verify Review Workflow:**
   - Developer submits task for review → Status: "Pending Review"
   - Team lead sees it in "All Team Tasks" with Approve/Reject buttons
   - Team lead approves → Status: "Completed"
   - OR Team lead rejects with notes → Status: "In Progress" with review notes visible

## Files Modified

### Backend:
- `backend/controllers/sprint.controller.js` - Added `getAllTeamTasks()` function
- `backend/routes/sprint.routes.js` - Added `/all-tasks` route

### Frontend:
- `frontend/src/context/DashboardContext.jsx` - Updated to fetch all team tasks

## API Endpoint Details

### GET /api/sprints/all-tasks
**Authentication:** Required  
**Authorization:** All authenticated users  
**Query Parameters:** 
- `page` (optional) - Page number for pagination
- `limit` (optional) - Items per page

**Response:**
```json
{
  "success": true,
  "count": 15,
  "totalCount": 45,
  "page": 1,
  "limit": 20,
  "totalPages": 3,
  "tasks": [
    {
      "_id": "...",
      "title": "Task title",
      "status": "Pending Review",
      "assignedTo": { "name": "Developer Name", "email": "..." },
      "reviewedBy": { "name": "Team Lead Name", "email": "..." },
      "reviewNotes": "...",
      "sprint": { "name": "Sprint 1" },
      "feature": { "name": "Feature Name" },
      "workType": "Backend",
      "estimatedHours": 8,
      "createdAt": "2026-05-01T..."
    }
  ]
}
```

## Benefits

1. ✅ Team leads can now see all team tasks including pending reviews
2. ✅ Proper separation between "My Tasks" (personal) and "All Team Tasks" (team-wide)
3. ✅ Review workflow is now complete and functional
4. ✅ No breaking changes to existing functionality
5. ✅ Maintains performance with parallel API calls
6. ✅ Proper pagination support for large teams

## Notes

- The endpoint respects product membership - users only see tasks from products they're members of
- Tasks are sorted by creation date (newest first)
- All task relationships (assignedTo, reviewedBy, sprint, feature) are properly populated
- The fix maintains backward compatibility with existing code
