# ClassHub Project: Object, Context, and Information

1. User
- Object: User (Teacher or Student)
- Context: Authentication, Profile Management, Role Assignment
- Information:
  - Name
  - Email
  - Password (hashed)
  - Role (Teacher/Student)
  - Profile details

2. Group
- Object: Group (Class Group)
- Context: Created and managed by teachers; joined by students
- Information:
  - Group Name
  - Group Code
  - Created By (Teacher)
  - Members (Users)
  - Created At

3. Announcement
- Object: Announcement (Post)
- Context: Created by teachers within a group; visible to group members
- Information:
  - Content/Text
  - Created By (Teacher)
  - Group
  - Timestamp

4. Comment
- Object: Comment (Message)
- Context: Added by students or teachers under an announcement
- Information:
  - Content/Text
  - Created By (User)
  - Announcement
  - Timestamp

5. Enrollment
- Object: Enrollment (Membership)
- Context: Represents a student joining a group
- Information:
  - User (Student)
  - Group
  - Enrollment Date

6. Authentication Token
- Object: JWT Token
- Context: Used for secure API access after login
- Information:
  - Token String
  - Expiry
  - Associated User



