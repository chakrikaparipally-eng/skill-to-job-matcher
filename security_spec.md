# SkillBridge AI — Firestore Security Specification

## 1. Data Invariants
1. **Identity Isolation**: Every private user record (`users`, `resumes`, `resumeAnalyses`, `quizResults`, `learningProgress`, `savedJobs`, `jobApplications`, `skillGapReports`) must carry `uid == request.auth.uid` on create and never change `uid` on update.
2. **PII Isolation**: `users/{userId}` holds private email/identity metadata and is readable/writable strictly by `userId == request.auth.uid`. `candidateProfiles/{userId}` excludes private phone/email PII and is readable by non-owners ONLY if `shareWithRecruiters == true` and the requester is a verified recruiter (`get()` on `users/{request.auth.uid}` confirms `accountType == 'recruiter'`).
3. **Role Enforcement**: Account creation allows `accountType in ['learner', 'job_seeker', 'recruiter']` and strictly blocks any admin privilege escalation (`role`, `isAdmin`). Only verified recruiters can create `recruiterProfiles`, `jobListings`, and `recruiterShortlists`.
4. **Temporal Integrity**: `createdAt` and `updatedAt` are validated against `request.time` (`serverTimestamp()`) on create and `updatedAt == request.time` on update, with `createdAt` immutable.
5. **Path & Size Hardening**: Every document ID matches `^[a-zA-Z0-9_\-]+$` (`<= 128` chars), every string has explicit `.size()` bounds, and every array has `.size() <= MAX`.
6. **Terminal State Locking**: Closed job listings (`status == 'closed'`) cannot be updated into invalid states without explicit reopen/action rules, and `quizResults`/`resumeAnalyses`/`skillGapReports` are immutable historical snapshots once recorded.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on User**: `{ uid: "u1", displayName: "A", email: "a@b.com", accountType: "learner", isAdmin: true, createdAt: T, updatedAt: T }` -> DENIED (shadow key `isAdmin` blocked by `hasOnly`).
2. **UID Spoofing on Resume**: `{ uid: "victim_uid", fileName: "cv.pdf", ... }` created by `"attacker_uid"` -> DENIED (`incoming().uid == request.auth.uid`).
3. **Recruiter Posting Spoof by Learner**: Learner attempts `create` in `/jobListings/job1` -> DENIED (`isRecruiter()` requires `users/{uid}.accountType == 'recruiter'`).
4. **Private Candidate Profile Read by Stranger**: Stranger attempts `get /candidateProfiles/target` where `shareWithRecruiters == false` -> DENIED.
5. **Candidate Profile PII Blanket List**: Authenticated user queries `/candidateProfiles` without `shareWithRecruiters == true` -> DENIED (`allow list` requires `resource.data.uid == request.auth.uid || resource.data.shareWithRecruiters == true`).
6. **Immutable `createdAt` Tampering**: Owner updates `/jobApplications/app1` modifying `createdAt` -> DENIED (`incoming().createdAt == existing().createdAt`).
7. **Forged Client Timestamp**: Client sends `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time` -> DENIED (`incoming().createdAt == request.time`).
8. **1MB String Exhaustion on ID/Title**: Client writes `/savedJobs/<200-char-id>` or `title` of 5000 chars -> DENIED (`isValidId` + string `.size()` bounds).
9. **Unbounded Array Injection**: Client writes `skills` array with 500 items into `/candidateProfiles/u1` -> DENIED (`skills.size() <= 60`).
10. **Shortlist Candidate Spoofing**: Recruiter A attempts to read/update Recruiter B's `/recruiterShortlists/s1` -> DENIED (`recruiterId == request.auth.uid`).
11. **Unverified Email Write**: User with `email_verified == false` attempts to write `/resumes/r1` -> DENIED (`request.auth.token.email_verified == true`).
12. **Public Catalog Tampering**: Signed-in learner attempts to write `/skills/python` -> DENIED (public catalog collections disallow client mutations).
