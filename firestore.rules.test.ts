/**
 * Security Rule Verification Harness for SkillBridge AI ("Dirty Dozen" Adversarial Payloads).
 * Intended to be executed against the Firebase Emulator Suite (`@firebase/rules-unit-testing`).
 */

export interface AdversarialCase {
  id: string;
  name: string;
  collection: string;
  operation: 'create' | 'update' | 'get' | 'list';
  expectedOutcome: 'PERMISSION_DENIED';
  description: string;
  payload?: Record<string, unknown>;
}

export const DIRTY_DOZEN_CASES: AdversarialCase[] = [
  {
    id: 'DD-01',
    name: 'Shadow Field Injection on User',
    collection: 'users/u1',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    description: 'Attempt to add undeclared isAdmin field to user account document.',
    payload: {
      uid: 'u1',
      displayName: 'Attacker',
      email: 'attacker@example.com',
      accountType: 'learner',
      isAdmin: true,
    },
  },
  {
    id: 'DD-02',
    name: 'UID Spoofing on Resume',
    collection: 'resumes/r1',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    description: 'Authenticated user u2 attempts to create a resume document claiming uid u1.',
    payload: {
      uid: 'u1',
      fileName: 'cv.pdf',
      fileType: 'pdf',
      fileSize: 1024,
      extractedText: 'Sample text',
      parsedProfile: {},
    },
  },
  {
    id: 'DD-03',
    name: 'Recruiter Posting Spoof by Learner',
    collection: 'jobListings/j1',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    description: 'User with accountType=learner attempts to publish a job listing.',
  },
  {
    id: 'DD-04',
    name: 'Private Candidate Profile Read by Non-Owner',
    collection: 'candidateProfiles/u1',
    operation: 'get',
    expectedOutcome: 'PERMISSION_DENIED',
    description: 'Recruiter attempts to read candidate profile where shareWithRecruiters == false.',
  },
  {
    id: 'DD-05',
    name: 'Unfiltered Candidate Profile List Query',
    collection: 'candidateProfiles',
    operation: 'list',
    expectedOutcome: 'PERMISSION_DENIED',
    description: 'Authenticated user runs blanket list query without shareWithRecruiters == true filter.',
  },
  {
    id: 'DD-06',
    name: 'Immutable createdAt Tampering',
    collection: 'jobApplications/app1',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    description: 'Owner attempts to modify createdAt during application status update.',
  },
  {
    id: 'DD-07',
    name: 'Forged Client Timestamp',
    collection: 'savedJobs/s1',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    description: 'Client supplies arbitrary past timestamp instead of request.time serverTimestamp.',
  },
  {
    id: 'DD-08',
    name: 'Path ID Poisoning',
    collection: `savedJobs/${'a'.repeat(200)}`,
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    description: 'Client attempts to write document with >128 char ID.',
  },
  {
    id: 'DD-09',
    name: 'Unbounded Array Exhaustion',
    collection: 'candidateProfiles/u1',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    description: 'Client injects 100 skill strings exceeding skills.size() <= 60 bound.',
  },
  {
    id: 'DD-10',
    name: 'Cross-Recruiter Shortlist Tampering',
    collection: 'recruiterShortlists/sl1',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    description: 'Recruiter B attempts to update shortlist belonging to Recruiter A.',
  },
  {
    id: 'DD-11',
    name: 'Unverified Email Write Attempt',
    collection: 'resumes/r2',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    description: 'User with email_verified == false attempts to write resume document.',
  },
  {
    id: 'DD-12',
    name: 'Public Catalog Mutation Attempt',
    collection: 'skills/python-programming',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    description: 'Authenticated learner attempts to overwrite public skill catalog.',
  },
];
