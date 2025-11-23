# Resume Feedback Backend - Technical Implementation Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (resume-feedback)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │   POST /api/resume-feedback        │
        └────────────────────┬───────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼────┐      ┌──────▼─────┐   ┌──────▼──────┐
    │  File    │      │  Rate      │   │  Coin       │
    │ Extraction│     │ Limiting   │   │ Validation  │
    └────┬─────┘      └────────────┘   └─────────────┘
         │                                       │
         └───────────────┬───────────────────────┘
                         │
                    ┌────▼─────────┐
                    │ Validation   │
                    │  Framework   │
                    └────┬─────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────▼────┐  ┌──────▼──────┐  ┌────▼──────┐
    │   ATS    │  │ Bangladesh  │  │    JD     │
    │  Scoring │  │   Market    │  │ Alignment │
    │ Engine   │  │   Database  │  │  Analysis │
    └──────────┘  └─────────────┘  └───────────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
          ┌──────────────▼──────────────┐
          │ System Instruction Builder  │
          └──────────────┬──────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────▼────┐  ┌──────▼──────┐  ┌────▼──────┐
    │Perplexity│  │    Groq     │  │ Fallback  │
    │  Sonar   │  │   Llama     │  │  Handler  │
    └──────────┘  └─────────────┘  └───────────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
                    ┌────▼─────┐
                    │   JSON    │
                    │ Response  │
                    └───────────┘
```

---

## Core Components

### 1. Bangladesh Job Market Database
**Location**: `BANGLADESH_SECTORS` object (top of route.ts)

```typescript
interface Sector {
  employers: string[];
  salaryRange: string;
  inDemandSkills: string[];
}

BANGLADESH_SECTORS: {
  'IT': { employers: [...], salaryRange: '...', inDemandSkills: [...] },
  'Finance': { ... },
  'Telecom': { ... },
  'Manufacturing': { ... },
  'FMCG': { ... },
  'HR/Recruitment': { ... },
  'General': { ... }
}
```

**Purpose**: Provides market context for resume evaluation
**Update Frequency**: Quarterly (employer updates, salary adjustments)
**Data Source**: Public job portals, industry reports

---

### 2. ATS Keyword Categories
**Location**: `ATS_KEYWORD_CATEGORIES` object

```typescript
interface ATSKeywords {
  technicalSkills: string[];      // 50+ technical skills
  softSkills: string[];            // 20+ soft skills
  certifications: string[];         // 13+ certifications
  actionVerbs: string[];            // 170+ action verbs
}
```

**Technical Skills**: Python, Java, JavaScript, React, Node.js, AWS, etc.
**Soft Skills**: Communication, Leadership, Problem-solving, etc.
**Certifications**: PMP, CISSP, AWS Certified, Google Cloud, etc.
**Action Verbs**: Comprehensive list of strong resume action verbs

---

### 3. ATS Scoring Algorithm
**Location**: `calculateATSScore()` function

#### Scoring Breakdown (100 points total)

```typescript
function calculateATSScore(
  resumeText: string,
  jobDescription: string = ''
): {
  atsScore: number;              // 0-100
  matchedKeywords: string[];     // Found keywords
  missingKeywords: string[];     // Not found but relevant
  atsBreakdown: Record<string, number>;  // Component scores
}
```

#### Scoring Formula

| Component | Points | Algorithm |
|-----------|--------|-----------|
| Formatting | 0-25 | Email ✓5, LinkedIn ✓5, Phone ✓5, Lines ✓5, Headers ✓5 |
| Tech Skills | 0-10 | Match each of 50 skills × 0.4 points (max 20) → cap at 10 |
| Soft Skills | 0-5 | Match each of 20 skills × 0.3 points (max 6) → cap at 5 |
| Certifications | 0-10 | Match each of 13 certifications × 1 point (max 13) → cap at 10 |
| Action Verbs | 0-15 | Count matches of 170 verbs × 0.5 points each (max 85) → cap at 15 |
| Quantification | 0-10 | Count metrics/numbers × 0.8 points (max 100+) → cap at 10 |
| Sections | 0-10 | (Found sections / Total sections) × 10 |
| JD Alignment | 0-30 | (Matched JD keywords / Total JD keywords) × 30 (if JD provided) |

#### Example Calculation

```
Resume: "Python developer with 5+ years experience..."
- Email: ✓ (+5)
- LinkedIn: ✓ (+5)
- Phone: ✓ (+5)
- 18 lines: ✓ (+5)
- Headers: ✓ (+5)
= Formatting: 25/25

- Python ✓, JavaScript ✓, React ✓: 3 × 0.4 = 1.2 → capped
- 50+ skills checked, 6 matched = 2.4 → capped at 10
- Result: Keywords: 10/25

- 8 strong action verbs found: 8 × 0.5 = 4.0
- Result: Action Verbs: 4/15

- Quantifiers: "5+", "years", etc. = 3 matches × 0.8 = 2.4
- Result: Quantification: 2.4/10

- Sections: All 4 (100%) = 10/10
= Total: 25 + 10 + 4 + 2.4 + 10 = 51.4 → Final Score: 51/100
```

---

### 4. System Instruction Builder
**Location**: `createSystemInstruction()` function

#### Input Parameters
```typescript
function createSystemInstruction(
  industryPreference: string,
  hasJobDescription: boolean,
  resumeText?: string,
  jobDescription?: string
): string
```

#### Instruction Components

1. **Security Protocols**
   - Prevents jailbreak attempts
   - Blocks score manipulation
   - Enforces JSON-only output

2. **Bangladesh Market Context**
   - Industry-specific data
   - Salary expectations
   - Employer information
   - Skill requirements

3. **Scoring Framework**
   - Score ranges (0-10 scale)
   - Percentile interpretation
   - Market benchmarking

4. **ATS Analysis Data** (if resume provided)
   - Pre-calculated ATS score
   - Component breakdown
   - Matched/missing keywords

5. **JD Context** (if JD provided)
   - Alignment analysis instructions
   - Gap identification requirements
   - Keyword matching directives

6. **Output Requirements**
   - JSON structure specification
   - Field requirements
   - Value constraints
   - Array minimums

---

### 5. AI Provider Chain
**Providers**: Perplexity Sonar → Groq Llama-3.3-70B

#### Perplexity Configuration
```typescript
model: "sonar"
max_tokens: 3000
temperature: 0.2  // Low randomness for consistency
response_format: JSON (implicit)
timeout: 7 seconds
```

#### Groq Configuration
```typescript
model: "llama-3.3-70b-versatile"
max_tokens: 3000
temperature: 0.2
response_format: { type: "json_object" }
timeout: 7 seconds
```

#### Fallback Logic
```
Request → Perplexity (7s timeout)
         ↓ Success? Return
         ↓ Failure
         → Groq Llama (7s timeout)
           ↓ Success? Return
           ↓ Failure
           → Error Response
```

---

## API Request Flow

### Step 1: Rate Limiting
```typescript
checkRateLimit(req)
├─ Extract IP from headers
├─ Check burst limit (10 req/5sec)
├─ Check normal limit (30 req/60sec)
└─ Return: { allowed: boolean, retryAfter?: number }
```

### Step 2: Content Type Detection
```typescript
if (multipart/form-data) {
  // File upload path
  ├─ Extract file from form
  ├─ Validate file size (<200KB)
  ├─ Validate file type (PDF/DOCX)
  ├─ Extract text with Gemini
  └─ Set resumeText = extracted content
} else {
  // JSON request path
  ├─ Parse JSON body
  └─ Set resumeText = body.resumeText
}
```

### Step 3: Coin Validation (if userId provided)
```typescript
if (userId && isInitialAnalysis) {
  hasEnoughCoins = await CoinManagerServer.hasEnoughCoins(
    userId,
    LIMITS.COINS_PER_FEATURE  // = 1 coin
  )
  
  if (!hasEnoughCoins) {
    return 402 Insufficient coins error
  }
  
  // Atomic deduction
  batch = new CoinBatchQueue()
  batch.add({ type: 'deduct', userId, amount: 1 })
  batch.add({ type: 'log', userId, ... })
  await batch.flush()
}
```

### Step 4: Content Validation
```typescript
validateResumeContent(content)
├─ Injection attack detection
├─ Suspicious content filtering
├─ Irrelevant keyword detection
├─ Dangerous keyword detection
├─ Resume keyword verification
└─ Length validation (100-25000 chars)
```

### Step 5: ATS Scoring
```typescript
calculateATSScore(resumeText, jobDescription)
├─ Formatting checks
├─ Keyword matching (skills, certs, verbs)
├─ Quantification detection
├─ Section validation
├─ JD alignment (if provided)
└─ Return: { score: 0-100, breakdown, keywords }
```

### Step 6: System Instruction Creation
```typescript
systemInstruction = createSystemInstruction(
  industryPreference,
  hasJobDescription,
  resumeText,
  jobDescription
)
// Embeds ATS score, market data, JD context
```

### Step 7: AI Analysis
```typescript
result = executeWithFallback(
  apiMessages,
  systemInstruction
)
├─ Try Perplexity Sonar (7s timeout)
├─ If fails → Try Groq Llama (7s timeout)
└─ Return: { success, content, provider }
```

### Step 8: JSON Parsing & Response
```typescript
feedbackObject = JSON.parse(result.content)
return {
  feedback: feedbackObject,
  isInitialAnalysis: true,
  providerInfo: "...",
  conversationEnded: true
}
```

---

## Response JSON Structure

### Top-Level Fields
```typescript
{
  overallScore: number;              // 0-10 (sometimes with decimal)
  scoreJustification: string;        // Why this score
  marketPositioning: string;         // Where they rank
  overallFeedback: string;          // 2-3 sentence summary
  strengthsAnalysis: { ... };       // Strengths + context
  weaknessesAnalysis: { ... };      // Gaps + impact
  atsOptimization: { ... };         // ATS breakdown
  jdAlignment: { ... };             // JD matching (if provided)
  sectionFeedback: { ... };         // Per-section analysis
  bangladeshSpecificAdvice: { ... };// Market-specific tips
  actionableImprovements: { ... };  // Timeline-based fixes
  improvementPriority: { ... };     // Top 3 priorities
  marketInsights: { ... };          // Trends & guidance
  suggestedActionVerbs: string[];   // Better verb options
  finalRecommendation: { ... };     // Application readiness
}
```

### Nested Objects

#### strengthsAnalysis
```typescript
{
  topStrengths: string[];     // 2-3 specific strengths
  whyMatters: string;        // Market value explanation
}
```

#### weaknessesAnalysis
```typescript
{
  criticalGaps: string[];    // Specific weaknesses
  marketImpact: string;      // How gaps affect hiring
}
```

#### atsOptimization
```typescript
{
  atsScore: number;                    // 0-100
  atsScoreJustification: string;      // Why this score
  formattingIssues: string[];         // Specific problems
  keywordGaps: string[];              // Missing keywords
  keywordMatches: string[];           // Found keywords
  formatRecommendations: string[];    // Formatting fixes
  atsImprovementPriority: string;    // #1 ATS fix
}
```

#### jdAlignment (if JD provided)
```typescript
{
  alignmentPercentage: number;        // 0-100
  alignmentAnalysis: string;          // How well matched
  matchedRequirements: string[];      // Found requirements
  missingRequirements: string[];      // Missing requirements
  suggestedAdditions: string[];       // What to add
}
```

#### sectionFeedback
```typescript
{
  contactInfo: SectionStatus;
  summary: SectionStatus;
  experience: SectionStatus;
  education: SectionStatus;
  skills: SectionStatus;
  projects: SectionStatus;
  certifications: SectionStatus;
}

interface SectionStatus {
  status: 'complete' | 'incomplete' | 'missing';
  feedback: string;
  priority: 'high' | 'medium' | 'low';
  examples?: string[];
}
```

#### bangladeshSpecificAdvice
```typescript
{
  employerTargeting: string;     // Top 3 employers for this resume
  culturalAlignment: string;     // BD market expectations
  visibilityTips: string;        // How to stand out
  linkedinOptimization: string; // LinkedIn improvements
}
```

#### actionableImprovements
```typescript
{
  immediate: string[];    // 0-1 hour fixes
  shortTerm: string[];    // 1-2 week improvements
  longTerm: string[];     // 1-3 month developments
}
```

#### improvementPriority
```typescript
{
  rank1: string;    // Most critical with ROI
  rank2: string;    // Second priority
  rank3: string;    // Third priority
}
```

#### marketInsights
```typescript
{
  industryTrends: string;       // Current market trends
  salaryExpectation: string;    // Expected salary range
  competitionLevel: string;     // Market competitiveness
  careerPathAdvice: string;     // Career progression
  skillsToAcquire: string;      // High-ROI skills
}
```

#### finalRecommendation
```typescript
{
  isReadyForApplying: boolean;         // True/False
  estimatedCallbackRate: string;       // "20-30%" format
  nextSteps: string[];                 // Action steps
  warningFlags: string;                // Red flag warnings
}
```

---

## Error Handling

### Rate Limit Exceeded
```
Status: 429 Too Many Requests
Body: {
  error: "Too many requests. Please try again later.",
  retryAfter: 45  // seconds
}
```

### Insufficient Coins
```
Status: 402 Payment Required
Body: {
  error: "Insufficient coins",
  currentCoins: 0,
  requiredCoins: 1
}
```

### Invalid Content
```
Status: 400 Bad Request
Body: {
  error: "Invalid content: irrelevant_content"
}
```

### Content Injection Detected
```
Status: 200 OK
Body: {
  feedback: "My purpose is to provide professional resume feedback...",
  isInitialAnalysis: false,
  blocked: true
}
```

### AI Provider Failure
```
Status: 500 Internal Server Error
Body: {
  error: "An unexpected error occurred while analyzing your resume."
}
```

---

## Performance Considerations

### Processing Timeline
```
File Upload (if applicable)      : 2-3 seconds (Gemini extraction)
Rate Limiting Check              : <100ms
Coin Validation                  : 500ms-1s (Firestore query)
Content Validation              : <100ms
ATS Scoring                     : <100ms (runs parallel with AI)
System Instruction Building     : <50ms
AI Analysis (Perplexity)       : 4-7 seconds (or fallback to Groq)
JSON Parsing                    : <50ms
─────────────────────────────────────────
Total (no file, first provider) : 5-10 seconds
Total (with file)               : 7-13 seconds
```

### Optimization Strategies

1. **Parallel Processing**
   - ATS scoring runs while building system instruction
   - Coin validation runs independently

2. **Lazy Loading**
   - AI SDKs loaded only when needed
   - Market data loaded on first use

3. **Caching Opportunities**
   - Bangladesh sector data (cache-control: 1 week)
   - ATS keyword categories (cache-control: 1 month)
   - Precompile system instructions

4. **Rate Limiting Cleanup**
   - Periodic cleanup every 60 seconds
   - Prevents memory leaks in long-running processes

---

## Testing Checklist

### Unit Tests
- [ ] ATS scoring algorithm accuracy
- [ ] Keyword matching logic
- [ ] JD alignment calculation
- [ ] JSON response structure validation

### Integration Tests
- [ ] File upload → text extraction → analysis
- [ ] JSON request → validation → analysis
- [ ] Coin deduction workflow
- [ ] Rate limiting logic

### E2E Tests
- [ ] Complete flow with JD provided
- [ ] Complete flow without JD
- [ ] File upload with large PDF
- [ ] Multiple rapid requests (rate limit)

### Edge Cases
- [ ] Empty resume text
- [ ] Resume with no keywords
- [ ] JD with no matching skills
- [ ] AI provider timeouts
- [ ] Malformed JSON from AI
- [ ] Injection attempts

---

## Deployment Checklist

Before production:

- [ ] All error scenarios tested
- [ ] Rate limiting verified
- [ ] Coin deduction atomic operations confirmed
- [ ] ATS scoring validated against test resumes
- [ ] JSON structure validated
- [ ] AI provider failover tested
- [ ] Performance benchmarked (<15s p95)
- [ ] Security scan completed
- [ ] Bangladesh market data verified
- [ ] Documentation updated

---

## Future Enhancements

### Phase 2 Potential Features
- [ ] Resume video analysis integration
- [ ] Salary negotiation guidance
- [ ] Interview preparation based on resume
- [ ] Real-time job matching
- [ ] Resume version comparison
- [ ] Industry-specific resume templates
- [ ] Multi-language resume support

### Data Expansion
- [ ] More Bangladesh sectors
- [ ] Regional salary data (Dhaka vs. Chittagong)
- [ ] Company-specific rubrics
- [ ] Emerging skills database
- [ ] Skill difficulty ratings

---

## Monitoring & Maintenance

### Key Metrics to Track
- ATS score distribution (should be 5-7 average)
- JD alignment accuracy
- Provider success rate (should be >98%)
- Average response time
- Error rate by type
- User satisfaction score

### Regular Maintenance
- Weekly: Review error logs
- Monthly: Update market data
- Quarterly: Skill database refresh
- Quarterly: Employer information update
- As needed: Salary range adjustments

---

**Version**: 1.0
**Last Updated**: November 2024
**Maintainer**: Engineering Team
