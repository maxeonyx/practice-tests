You are a senior product engineer, learning-systems designer, and UX designer. You are taking over an existing website/repository called **Practice Tests** and turning it into a new adaptive revision platform for **Kira**, a nursing student with two important exams approximately three weeks away.

This is intended to become an exceptionally good revision product, not merely a collection of flashcards.

## The goal

Build a low-friction, highly visual, mobile-first revision system that Kira can use while she is on nursing placement.

She often has limited time and energy available for studying. The application should make it possible to open the app and immediately know:

- what to study now;
- why it matters;
- how it fits into the course;
- what she already knows;
- what she is weak on;
- what is due for review;
- how prepared she is for each exam.

There are **two separate nursing courses**:

1. Integrated Care Nursing
2. Pharmacology Nursing

Keep the courses conceptually and visually separate, with their own curricula, mastery, questions, and progress.

However, the application should intelligently construct a combined revision workload across them. One exam occurs before the other, so the first exam should receive more attention as it approaches without allowing the second course to be neglected.

Exact assessment dates, course structures, learning outcomes, assessment weightings, and examinable material will later come from a large package of downloaded course content that I will provide.

Do not invent those details now.

The overall objective is to prepare her extremely well for her upcoming assessments, including the Integrated Care Nursing knowledge/final assessments and the Pharmacology assessment(s).

\# Design for unknown study time

Do not assume a fixed amount of study time per day or across the three weeks.

The system must be useful whether Kira has **5 minutes, 20 minutes, an hour, or several hours** available. Every study session should produce useful progress, even if she stops unexpectedly.

Prioritisation should therefore be **anytime-friendly**: always present the highest-value next learning/review activity first rather than relying on completing a predetermined daily lesson.

There should be no minimum session length required for the curriculum to make sense.

With more time, the system should naturally continue deeper through the curriculum, integrated questions, weak areas, and spaced reviews. With very little time, it should still spend that time on the most valuable material available.

In other words, revision quality should degrade gracefully with less available time and continue improving with more available time, rather than depending on a fixed study schedule.

---

# Product model

Do **not** think of this primarily as a flashcard application.

Think of it as:

**curriculum → concepts → relationships → exam questions → diagnosis of gaps → targeted learning → spaced review → exam readiness**

Flashcards are one interaction inside that system.

## The curriculum should be visible

Kira should have a highly visual representation of each course.

She should be able to see something analogous to:

Course
→ topic
→ concept cluster
→ individual concepts
→ integrated/application questions

The interface should make progress obvious without displaying huge amounts of text.

Possible visual language could include:

- curriculum maps;
- topic tiles;
- progress rings;
- mastery indicators;
- small dependency trees;
- concept maps;
- drug ↔ condition relationships;
- body-system diagrams where useful;
- small tables;
- timelines;
- decision flows;
- labelled illustrations from course material where educationally useful.

Avoid decorative visual noise. Visual elements should make the subject easier to understand.

---

# The central learning interaction

A particularly important interaction is an **exam-style question that can decompose itself into prerequisite knowledge**.

For example, imagine an exam question approximately like:

> Explain the use of Drug X in Condition Y and the relevant nursing considerations.

Kira should be able to attempt the complete exam question first.

Her answer should ideally be enterable by:

- typing;
- speech-to-text/dictation where practical;
- normal device dictation as a fallback.

Do not make microphone functionality a hard dependency if browser support would make that fragile. Progressive enhancement is preferable.

After answering, she should be able to compare her response against a concise answer/rubric and indicate whether she knew it, partly knew it, or missed it.

But there must also be a prominent:

**I don't know**

action.

If she does not know the answer, the system should not simply reveal a large answer.

Instead, decompose the question into the knowledge required to answer it.

For example:

- What is Drug X?
- What class of drug is it?
- What does it do?
- What is Condition Y?
- What is happening physiologically in Condition Y?
- Why is Drug X useful in Condition Y?
- What does the nurse need to assess, administer, monitor, educate, or recognise?

Only create subdivisions that are actually relevant to that question and are supported by the course material.

These become small intuitive learning interactions.

Once those pieces are understood, return to the original integrated exam question.

The desired learning experience is:

**“I don't know this” → “What part don't I know?” → learn the missing pieces → reconstruct the answer → successfully answer the original question.**

This recursive decomposition is a central product idea.

Concepts should therefore ideally form a graph rather than existing only as isolated cards.

---

# Question design

Eventually support several kinds of questions, including:

- simple recall;
- concept recognition;
- explain-in-your-own-words;
- compare/differentiate;
- medication knowledge;
- condition/pathophysiology knowledge;
- drug + condition integration;
- nursing assessment and management;
- prioritisation;
- application/scenario questions;
- genuine exam-style constructed responses;
- questions using diagrams/images where the source material makes this useful.

Exam-style questions may legitimately contain more text because reading and interpreting the question is itself part of exam preparation.

Ordinary teaching screens should be extremely concise.

Do not turn course notes into paragraphs on cards.

---

# Spaced repetition and adaptive revision

Implement an Anki-like spaced-repetition model.

Prefer a modern, understandable scheduling algorithm such as **FSRS**, or an equivalently defensible implementation, rather than inventing arbitrary intervals.

Track at least:

- first exposure;
- review history;
- success/failure;
- confidence/mastery;
- due date;
- lapses;
- concept/question relationship;
- course;
- topic.

The learner should not have to understand the scheduling algorithm.

The primary interface should simply tell her what is worth doing now.

The scheduling system should combine:

- due reviews;
- exam proximity;
- curriculum importance;
- current mastery;
- weak prerequisite concepts;
- previous mistakes;
- unanswered curriculum material.

Do not hard-code a permanent 50/50 split between the two courses.

Course allocation should respond to the actual exam dates and progress. The earlier exam will generally receive greater weighting as it approaches, while ensuring the later exam is not starved of revision.

After the first exam, revision should naturally shift heavily toward the remaining course.

---

# Exam skills are part of the curriculum

The app should teach a small amount of **exam technique**, not only nursing content.

Examples include:

- quickly surveying the exam before beginning;
- identifying mark values;
- estimating how much time each section deserves;
- doing high-confidence/high-value work efficiently;
- avoiding spending excessive time on one difficult question;
- leaving genuinely difficult material and returning later;
- recognising command words such as explain, compare, identify, discuss, prioritise;
- allocating answer depth according to marks available;
- recovering when under time pressure;
- leaving time for a final check.

These should appear as concise, practical learning items and occasionally be incorporated into realistic practice exams.

Avoid generic motivational filler.

---

# Course content and source fidelity

Later I will provide a large package containing downloaded course material for both courses.

It may include PDFs, lecture slides, handouts, course guides, learning outcomes, assessment information, readings, tables, diagrams, and other resources.

That package is the primary source of truth for what Kira needs to know for these exams.

When that material arrives:

1. Inventory it before generating content.
2. Determine the actual curriculum and assessment structure.
3. Separate Integrated Care material from Pharmacology material.
4. Extract learning outcomes and examinable topics.
5. Identify recurring/high-emphasis concepts.
6. Construct a concept/dependency graph.
7. Build questions from those concepts.
8. Construct realistic integrated/exam questions from combinations of concepts.
9. Preserve useful images/diagrams where legally and technically appropriate.
10. Maintain traceability back to the original source.

Every generated curriculum object/question should be able to retain metadata such as:

- source file;
- page/slide where possible;
- course;
- topic;
- learning outcome;
- assessment relevance.

Do not silently invent medical/nursing information that is absent from the supplied course material.

If supplementary external clinical information is ever introduced, it must be deliberate, sourced, visibly distinguishable from course material, and requested or clearly justified.

Exam alignment matters more than producing enormous quantities of generic nursing questions.

Quality over quantity.

---

# Architecture principle: local-first

This site is hosted using GitHub Pages and should remain capable of being a static application.

Avoid making a runtime server or runtime LLM dependency fundamental to the learning experience.

A good eventual architecture would allow the expensive/intelligent content-generation step to happen during development/content ingestion, producing structured curriculum data that the PWA can use completely locally.

The actual study experience should remain useful:

- offline;
- with poor connectivity;
- without an AI service being available.

Runtime AI could be added later if genuinely valuable, but do not make it foundational without a good reason.

---

# Persistence

This must be an installable **PWA**.

Study state must survive:

- closing the browser;
- reopening the application;
- installing the PWA;
- ordinary application updates.

Use an appropriate local persistence layer, probably IndexedDB behind a clean abstraction rather than scattering direct storage calls throughout the code.

Design the data model with migration/versioning in mind because the application will evolve rapidly.

Persist things such as:

- curriculum progress;
- question attempts;
- spaced-repetition state;
- mastery;
- weak concepts;
- study history;
- current session;
- preferences.

Do not make the user create an account merely to preserve local progress.

Later backup/sync/export can be considered separately.

---

# UX standard

The UX matters enormously.

This should feel like a carefully designed consumer application, not an LMS and not a page of generated text.

Design for a tired nursing student using a phone between other responsibilities.

Principles:

- mobile first;
- very low cognitive overhead;
- extremely obvious primary action;
- large comfortable touch targets;
- one major decision at a time;
- strong visual hierarchy;
- little text except where the learning itself requires text;
- immediate response to interactions;
- easy interruption and resumption;
- progress visible without needing to inspect statistics;
- accessible typography;
- excellent contrast;
- usable one-handed where practical;
- smooth but restrained animation;
- no clutter;
- no dashboard full of meaningless metrics;
- no childish gamification.

The overall feeling should be calm, modern, clear, confident, and supportive.

Aim for **excellent**, not merely acceptable.

---

# Important implementation constraint: the existing Practice Tests application

There is already an application in this repository called **Practice Tests**.

I do not want to evolve that product.

I want to throw the application away and reuse only the infrastructure that is valuable.

### Do not spend time understanding the existing product.

Inspect only what is necessary to preserve infrastructure such as:

- repository structure;
- package/build configuration where useful;
- GitHub Pages deployment;
- GitHub Actions/deployment workflows;
- CNAME/custom-domain configuration;
- manifest/domain/public-path details that are deployment-critical;
- package manager;
- any genuinely useful infrastructure configuration.

Do **not** inherit the existing:

- product architecture;
- components;
- page structure;
- visual design;
- content;
- question model;
- data model;
- styling;
- UX assumptions.

Delete obsolete application code/assets rather than carrying dead compatibility code forward.

Preserve the Git repository/history and the GitHub Pages/custom-domain setup.

Do not accidentally remove or replace the CNAME or break the existing deployment URL.

If a file might be deployment-critical, understand its purpose before deleting it.

You may preserve the existing build toolchain if it is clean and appropriate. If replacing the application layer is cleaner, replace it.

Favor the smallest clean architecture over continuity with the previous implementation.

---

# FIRST TASK — do this now

Do **not** wait for the course-content package.

Do **not** create fake nursing content.

Do **not** build the entire product yet.

The first milestone is to turn the existing repository into the clean foundation for this new application.

### 1. Strip the existing product

Remove the old Practice Tests application implementation and content while preserving the repository/deployment infrastructure described above.

Avoid spending time analysing code that is going to be deleted.

### 2. Establish the new application shell

Create a clean foundation suitable for the product described above.

Use a modern, maintainable front-end architecture.

Prefer TypeScript.

Keep dependencies modest and justified.

Do not create abstractions merely because they may theoretically be useful later.

Create clean boundaries for:

- curriculum/content;
- study state;
- spaced-repetition state;
- persistence;
- routing/navigation;
- presentation.

### 3. Make it a proper PWA

Set up:

- web app manifest;
- icons/placeholders as appropriate;
- service-worker/offline application shell;
- installability;
- correct GitHub Pages/custom-domain behaviour.

Do not cache in a way that makes deployments impossible to update reliably.

### 4. Establish local persistence

Create the persistence foundation and a versioned state/data schema.

It does not yet need real nursing content.

It should be possible to prove that a small piece of state survives reloads.

### 5. Build one excellent landing/home screen

For now the application can contain only a polished foundation/landing experience.

It should make clear that this is Kira's revision system and that there are two courses:

- Integrated Care Nursing
- Pharmacology Nursing

Do not invent curriculum content.

It may show tasteful placeholders such as:

- Today's revision
- Integrated Care
- Pharmacology
- progress not yet started

But avoid building fake functionality.

The page should already demonstrate the intended visual quality, mobile layout, typography, spacing, navigation principles, and PWA feel.

I should be able to look at this first screen and feel that the product is heading toward something exceptional.

### 6. Prepare the structure for the next iteration

Create enough domain structure that we can later introduce objects conceptually resembling:

Course
Assessment
CurriculumUnit
Concept
Question
QuestionPart / prerequisite relationship
StudyAttempt
ReviewState
SourceReference

Do not prematurely implement a gigantic generic schema. Establish only what materially helps the next iterations.

### 7. Verify it

Before considering this milestone finished:

- run the build;
- run relevant tests/type checks/linting;
- verify persistence;
- verify responsive layout;
- verify PWA basics;
- verify GitHub Pages deployment assumptions;
- verify the custom-domain/CNAME configuration remains intact;
- remove old dead assets/code;
- confirm no old Practice Tests product content is accidentally visible.

Where practical, include focused tests for logic that deserves tests rather than snapshot-testing UI trivia.

---

# How to work

Act rather than producing a long speculative architecture document first.

Investigate only enough of the existing repository to safely replace the product while retaining its deployment infrastructure.

Make sensible engineering decisions autonomously.

Do not ask me to choose between minor libraries, colours, naming conventions, or implementation details.

If something genuinely affects the long-term product architecture, make the cleanest reversible choice and explain it afterward.

Prefer:

**simple + excellent + extensible**

over:

**general + complicated + theoretically future-proof**

Keep commits logically understandable if you are committing changes.

If you have permission to deploy through the repository's existing workflow, preserve and use that path rather than inventing a new deployment mechanism.

---

# What not to do yet

For this first milestone, do not:

- generate fake course curricula;
- create hundreds of placeholder questions;
- create a backend;
- add authentication;
- add cloud databases;
- integrate an LLM API;
- spend significant effort on analytics;
- build social features;
- add gamification;
- implement every future screen;
- reproduce the old Practice Tests UI;
- over-engineer a design system;
- make the app depend on network connectivity.

We are going to iterate rapidly over the next few hours.

Build the foundation so the next changes are easy.

---

# After completing this milestone

Give me a concise report containing:

1. what old application material was removed;
2. what infrastructure was intentionally preserved;
3. the stack/architecture now in place;
4. how local persistence works;
5. PWA/offline status;
6. GitHub Pages/custom-domain status;
7. the most important product/design decisions you made;
8. anything that genuinely needs my attention.

Then stop.

The next major step will be for me to provide the two-course content package. At that point we will reconstruct the actual curriculum and begin creating the adaptive study system from real source material.

## Subsequent clarification — home screen

Sorry, I don't think the home screen should show both courses. It shouldn't let the user choose which course. It should just tell the user which course you should be studying. It should know how ready you are for the different courses, how many marks it's worth, etc. And then it should balance appropriately. It's not about the user choosing. It's about the scheduler deciding, and suggesting at least.

## Course-content iteration

`/home/maxeonyx/course-content-raw.zip`  Thank you very much, and now I would like you to take a look at the content from there. First of all, move that file into your directory here, and then I'd like you to explicitly go through the design process and, you know, come up with the effective curriculum content, UI principles. We're aiming for excellence here. We're not aiming for something half-baked. Excellence means putting a lot of work in to make it absolutely exactly what is required. No extra writing, extra UI functionality, extra anything. But the leaner and more precise something is, the more cognitive effort is required to get it just perfect. So don't skimp out on that. Do a lot of planning, do a lot of checks, aim for excellence here. Go ahead, give us amazing content and amazing user experience. The goal is that Kibra can go into this app, she can do her study, and the app will take care of her.

Pharmacology final date and weighting, supplied by Max: "50% Nov 2".

## Visual learning and recall interaction

Focus especially hard on how we can make things visual. It's going to be a lot easier to recall if the lessons are visual. Even, for example, the structure of the metabolic chain. You should see where you are in that as you revise the different parts of it.

For example, the integrated care. Some kind of mind map and pieces of it not filled in. You should see the question in the gap and then answer the question. For medical conditions, you might see a picture. For drugs, you might see the packaging. For test revision practices, you might see a little diagram of how that works. Again, aiming for excellence.

Yeah, and I'm imagining a two-phase answering part to a flashcard. If you see the question, you get I know it or I don't know it, right? Then once you see the answer, if you knew it, then you get asked, you know, was it easy? Was it hard? Was it, was it, you know, somewhere in the middle? And that can be useful information for the scheduler, Anki style. And the scheduler should also know about the curriculum somehow. And I'm sure that there's great algorithms out there that you know and can reproduce, you know, quite easily for us. So we can get an excellent result here. So we've got two things going on. We've got the system for effective curriculum learning, and then we've got the content in that effective curriculum, and how best to revise it guides what the system needs to be capable of doing.

> Also, you should take a look at the advice around the assignments. What content will be in which test. That information should be in the package I gave you.

> The final thing is that when Kebra is in the test, she's confident in answering the questions from what she's revised. So we should, while we do need to step back into the fundamental content and get understanding, we should also have actual test questions and answers in the course content, and in fact probably start with that and then explicitly step back. That's what I'm thinking.

> I think it's likely both exams will have long answer, you know, free form things at the end. For integrated care, definitely. For pharmacology, maybe. No. For pharmacology, definitely we have long answer. For integrated care, maybe long short answer. Yeah. They'll both likely have not. They won't just be multiple choice. They will have larger, more complicated questions, especially at the end of the test.
