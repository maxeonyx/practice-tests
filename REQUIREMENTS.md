# Project context from Max

Read this before product design or implementation. The recovered context below is an assistant interpretation; the conversation record preserves Max’s wording, including examples, hedging, changes of direction and name variants. The current phase is review of the prototype delivery plan in [PLAN.md](PLAN.md). The product model guides a build/testing/feedback loop, followed by curriculum review; agree the plan before implementing.

## Recovered context

The outcome is Kibra’s ability to answer her nursing exam questions confidently. She studies on placement, often tired, with unpredictable time. Five minutes must be useful; longer sessions must keep finding worthwhile work. The app takes care of selecting, teaching and reviewing material.

Current explicit direction: the learner sees one question, answers it to herself, and uses “I know it” or “I don’t know it”. The known path reveals the answer and asks about recall difficulty. An unknown question with prerequisite cards goes directly into those concepts instead of showing its full answer. Images and domain diagrams primarily ground the learning content where possible. A separate subtle wordless DAG becomes more prominent during prerequisite work and shows the stepping-back process. Curriculum planning, navigation, phases and scheduling remain in the background.

| Information | Status and evidence |
| --- | --- |
| Mobile is the primary interface; Kibra uses Chrome on iPhone. | Explicit priority and observed use. |
| One combined feed, selected by the scheduler. | Explicit direction; course identity and source records still matter behind the scenes. |
| Integrated Care should open the app at least for the first few days. | Latest preference, expressed with “might”; Kibra is more stressed about that exam. This does not request excluding Pharmacology from the rest of the feed. |
| Begin with a real exam multiple-choice question. | Explicit correction after trying the large written opening question. |
| Integrated Care requires authored exam-style questions and demanding preparation. | Latest context: no practice tests or previous exams for that course, so question types must be inferred. Max asks to err on too hard rather than not hard enough and anticipates more concepts and material to build up to. |
| One clear, manageable question at a time. | Explicit correction; questions must be separate from the accompanying diagram. |
| Mental recall and “I know it / I don’t know it”; recall difficulty helps scheduling. | Two reveal/learning decisions are explicitly confirmed as important. |
| “I don’t know it” with prerequisites enters them directly before the full answer. | Explicit latest instruction. This is internal teaching expressed through subsequent questions, not a visible prerequisite list. |
| For now, start on full questions every time, and step back into supporting concepts when needed. | Latest trial direction: “let's just try it without that rule” and “for now”. The prerequisite-pass condition was withdrawn. Spaced repetition and the distinction between learning after help and independent recall still apply. |
| Salbutamol/candidiasis sequence: parent question → smaller questions → original question. | Latest concrete example. It includes an unknown leaf revealing an answer and Next, a known-but-wrong correction, a Medium rating, then a Hard rating on the returned question. Treat the named questions as an illustrative flow, not a prescribed first-session lesson. |
| Multiple formats, including actual exam questions and longer answers. | Explicit earlier requirement. Long written questions as the default opening were rejected. How full written practice fits the latest minimal interaction remains open. |
| Start with the ordinary flashcard flow demonstrated by Max. | Latest scope direction. Other question types remain relevant; they do not all need a DAG. |
| A larger open question can motivate concept cards before full dictation practice. | Latest exploratory model: show the full task first, teach its concepts, and prompt the full dictated answer only when the learner is good at those concepts. If she gets them all wrong, leave the demanding full task for later. Exact readiness criteria are unsettled. |
| ChatGPT sign-in for open-answer work. | Exploratory “ideally”, “some kind”, “I don't know”; explicitly less important, extra and potentially cognitively demanding. Do not turn this into a core authentication or runtime-AI requirement. |
| No filler, greetings, slogans, avatars, dashboard metrics or metadata blocks in the learning flow. | Explicit dislikes from the first release. Reading is for learning content. |
| First-run home; subsequent fresh openings ask available time, then one tap opens the scheduler’s question. | Latest clarification resolves the previous time-prompt ambiguity. A small home control can return to home; a curriculum overview remains future work. |
| Quick reopening resumes; the next day starts fresh, and probably a few hours later does too. | Explicit next-day behaviour; same-day hours expressed tentatively. Fresh navigation does not discard learning history. Exact inactivity threshold is unspecified. |
| A fresh opening should feel good: approachable, genuine exam-relevant material and variety. | Explicit rejection of repeatedly opening to the same failed card. “Not artificially easy”; breadth across topics matters as the exam approaches. |
| Aesthetically appealing landing page. | Liked at first glance; its content and layout were then criticised. Preserve calm visual quality without preserving the page structure. |
| Subject visuals rather than text boxes styled as diagrams. | Explicit criticism. Pathway location, missing mind-map pieces, conditions, packaging and exam-method diagrams were examples, not a mandatory asset checklist. |
| No text other than content and functional controls on the study screen. | Latest clarification is screen-specific, not a demand for one screen in the whole app. Small home/provenance controls are allowed; stock/source images and domain diagrams are learning content. |
| A DAG, not a chain. | Explicit correction to the latest visual description. Shared concepts can support multiple questions; a fixed sequence/tree is insufficient. |
| Learning-structure DAG and learning-content visuals are distinct. | Latest explicit correction. The DAG is faint before entry, becomes more prominent as the learner steps back, and subtly animates current position. Domain images/diagrams ground the meaning of the content. |
| Different course colour schemes so the learner recognises the subject. | Latest request as an example of excellence; exact colours are unspecified. This is a visual cue in the combined feed. |
| Different course patterns as well as colours. | Latest exploratory “probably”, “some kind”, “or whatever”; geometric background patterns are an example, not a specified asset. |
| Exam dates, weights, learning gaps, study capacity and remaining content guide allocation. | Explicit scheduler direction. “Same amount of time per mark” is a useful baseline, subsequently qualified as “not, you know, 100%”. Breadth, weak areas and experience also matter. Evening/weekend/study-day hours remain unspecified. |
| After the first exam, focus entirely on the other course. | Explicit later wording, stronger than the original “shift heavily”. |
| Installable, offline, durable local progress without an account. | Original constraints; iPhone Chrome failed to present an installation option in Kibra’s observed use. |
| “Install app”. | Exact requested replacement for the button text “install kibra”; not implemented during the design phase. |
| Inspect excellent learning/flashcard products and adopt their useful ideas. | Explicit request; remove machinery rather than accumulate features. |
| Source-aligned medical teaching and assessment coverage. | Original and repeated requirement. The supplied archive is primary evidence; gaps and uncertain claims must remain visible to content authors. |
| Review source grounding explicitly for at least one Integrated Care question. | Latest request for the question-authoring phase. Source-derived facts, invented scenario details and uncertain exam format must be distinguished. |
| Excellence requires substantial design effort and checking. | Repeated motivation; implementation volume and content counts are not the target. |
| Plan/review, then build/testing/feedback, then curriculum review. | Latest explicit delivery sequence. Prototype feedback and representative curriculum review must fit Max’s availability tonight; remaining work can continue autonomously. |
| The whole curriculum must be in place before Kibra starts tomorrow at 5 pm. | Latest requirement plus “5pm” timing answer: Monday 5 October 2026, NZDT. Full coverage must be checked against assessed knowledge, not inferred from unit/card counts. |
| Max can be involved only in this build session, until midnight today, with autonomous work after that. | Latest exact availability: Sunday 4 October to Monday 5 October NZDT. Do not depend on his replies tomorrow. |

## Changes and open tensions

The original prompt requested visibly separate courses and a visible curriculum. Later messages rejected course choice, then the Home/Courses split and overview emphasis, and finally said the teaching structure should not be exposed at all. This is an explicit change of direction, not an instruction to make the old curriculum screen smaller.

The original prompt says not to think of the product primarily as flashcards. The latest description is a very simple question-and-answer feed. These can fit together if the curriculum and diagnosis are the hidden teaching model while questions are the learner’s interaction. That reconciliation is an assistant proposal, not a quotation from Max.

Earlier messages say “probably start” with actual test questions and step back, and describe a large exam question decomposing into pieces before returning to the whole. Later use rejected that large opening and the visible decomposition loop. Preserve the purpose—understanding that supports exam performance—while reconsidering the sequence and the interface.

The early missing-node example placed a question in the diagram gap. Later feedback explicitly says the question should be separate from the diagram. This later correction determines the proposed visual interaction.

Both exams need practice beyond multiple choice. Max’s self-correction confirms Pharmacology long answers and leaves Integrated Care’s larger/longer short-answer format uncertain. The exact place for full written practice and the assumed future study capacity are still design questions. “I know it / I don’t know it” is confirmed; the latest unknown-with-prerequisites instruction changes the earlier immediate-reveal interpretation.

Later feedback proposes a full question as motivation before its concept cards, with the demanding full dictated answer deferred until the learner is good at the concepts. This revisits the earlier rejection of a large free-form opening: presenting the task and demanding a complete answer are different actions in the proposed interpretation. Ordinary flashcards are the first scope; diagram interaction, multiple-choice wrong-answer routing and dictation are still partly exploratory.

The useful installation need is access from Kibra’s iPhone Home Screen. A pop-up was an example (“could be”), not a requirement for an automatic browser prompt.

The request for a real exam MCQ as the opening now sits beside an Integrated Care opening preference and the absence of its past/practice papers. Authored Integrated Care exam-style MCQs are a proposed reconciliation, with authenticity of source content distinguished from authenticity of an exam prompt. Greater challenge concerns preparation depth; it does not undo the request for individually clear questions or establish an exact syllabus expansion.

The latest clarification settles two previous misunderstandings: the structure DAG is a separate subtle orientation visual, not the content diagram; and a home/time screen can exist while the study screen contains only learning content and functional controls. Images should ground the actual subject as much as possible. Exact diagram rendering, palette and the suggested background patterns remain design work.

Max first proposed requiring correctly answered prerequisites before bringing back a parent. He then clarified that the parent returns the first time, with the condition applying to a new session. His next message withdrew that rule: “let's just try it without that rule. we just start on the full questions every time for now. that's more stepping back which is good”. Preserve this as a provisional choice, not a permanent scheduling constraint. The salbutamol example can run as written, including parent return after a wrong supporting answer. Reading an answer remains learning rather than evidence of correct independent recall.

## Conversation record

### Original pasted prompt

The following prompt is retained verbatim. Its first-milestone instructions describe the initial stage; subsequent messages below contain the later direction.

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

## First-release review — landing, feed, allocation and metadata

Hi, I'm just going through and reviewing the first release of the app now.

I like the landing page at an aesthetic level. It's appealing, although mostly at first glance only. It has a lot of junk text. For example, a little time, a clear next step. This is useless. The title, Your space to make it click. This is useless. Welcome, Kira, start with a question, we'll help you connect the pieces. It's a bit weird to address directly like that, and the text is useless. In fact, it has a lot of useless text on the page, right? A lot of it. So it's supposed to be functional first, and, you know, reading text should be reserved for the actual content of the course. Takes time, you know. So anyways, I like the What does your day allow? optional question. That should be more prominent though, because you would ask it before you click Start studying. And install the app doesn't need to be at the bottom of the scroll screen. It could be like, yeah, it could be a pop-up. Also, the idea of having a home and courses is kind of silly, and even an overview is a bit weird, because, like, in fact, how do you even start? Oh, potentially you can't start yet based on the current release. Is that right? Is that right? How can you even begin? I don't think we need an overview page per se. Well, if we do, it's a later on thing. Right now what I want to test actually is the basic, you know, you should go straight into the content, right? You should just get asked a question straight away. You should open the app, first time opening it, maybe you can be on the home screen, but second time opening it, maybe you get the How much time do you have? and then straight into content, like literally a question. That's the entire point of this. So, yeah, maybe the overview can be a separate view or something, but it's not important. And I don't think that the courses should be divided up so much. It should be one, like flashcard feed, and maybe it can go through phases, you know, within one day you do, you know, a few questions this course, a few questions that course, and then, you know, twice as many this course and then twice as many that course or something like that. And if you're following down a why, why, why, you know, stepping backwards thread, you can stay in the same course, going deeper into the content. But then once you've done the first set of questions, you can go to the next course, and you can just sort of alternate or something. And also the scheduler should be deciding what's important. You know, for example, after the exam date passes, it should focus entirely on the other course, and it should think about how many days and study time there are available and how much content needs to be covered in those days and weight it accordingly, so that if you were following it at the mix presented by the study guide app, you would cover around about proportional amount of content for each course over the total available time, so that you have, you know, not the same, because they're not worth the same amount, but the same amount of time per mark of both courses over the whole study time, with some reasonable assumption of, like, you know, evenings during the placement period, X number of hours on the weekend and in the study day on the week prior to the exam, and then after the first exam, the weekend spent any hours in there spent only on the second course. You've got a lot of aesthetically pleasing but useless stuff on this page. For example, the app title is in the main page flow, whereas it should be on the left-hand margin so that it doesn't take up any page space. The login thing on the top right, made for you, what is that doing there? Your curriculum, the whole picture, independent answers, blah blah blah. This is just completely useless text. Even the independent answers, untested questions, zero views, view counts. Those are taking up page space before you get to the actual important stuff on this page, which is the content. Right? The accordion list makes sense, although it's not actually an accordion now that I see. It's, um, they're just independently openable. Also, mobile is the primary interface for this. I don't know if you know that. I assume it works fine on mobile. I like the idea with assessment scope and core sources, but I don't know. It's a lot of text. For what purpose? And perhaps a separate view or a separate flow for the metadata and stuff like that. Like maybe there should be a little information button on a card or something that's hard to click. But if you do, it tells you the details. That sounds good. It shouldn't be part of the main app flow, you know? Totally a secondary thing. Not even a secondary thing, a tertiary thing. What I want you to do is go through and, sorry, go and search up other apps, other learning platforms, other flashcard apps, etc. Look for the really good ones and copy it. Just copy it. And take all the good ideas and take them all and improve it. We don't want to add more stuff. Less is more, right? You'll know you've done a really good job when it achieves— this app achieves the purpose with nothing extra. Nothing extra on the screen. Heaps under the hood, but the user only needs to know what they need to know. Everything else is in the way of learning.

## Kibra’s iPhone installation feedback

I have some feedback from Kibra. Firstly, when she opened it on her iPhone in Google Chrome, it didn't give her any options to add it to home screen or any options to install it or anything like that. So I'm not sure what to do to get it on her home screen as an app. And then, yeah, she's doing it now, and I'm going to do it and give you more feedback.

## First question — size, authenticity and starting format

Well, so this very first question. It's this, like, weird first question. It's not very studyable. It's not very good as a hook. It says, The journey of a medicine, and then it's a free-form answer. That's not good for study. It's too big. The question's way, way, way too big. Maybe it's good as an exam question, but is it a real exam question? Is it really inspired? It doesn't really look quite right. Maybe it is. I don't know. I don't think the app should ever open with a free-form answer like this. It's too much cognitive effort. It's not— it's defeating the purpose of the app. The exams have plenty of multiple choice in them, so we should start with a real exam multiple choice.

## First question — locating the question

What is even the question? This is, like, particularly bad. It doesn't really make any sense at all. It's giving us a diagram, and then it's not giving us any question. Yeah, it isn't. That's a bit bizarre, frankly. It's not good at all. Next.

## First question — unknown-answer interaction

And I clicked I don't know it, and it didn't move us to the next question. It didn't really make sense, sorry. It didn't really make sense at all. Maybe if it's a series of cards, like you could, you could, like select one or have to recall it, but, like, I don't get it, sorry. What was the question? Oh, the questions in the diagram. Right. I see. That's not a good UX at all. Really terrible user experience.

## First question — forced reconstruction

Oh, if it had the UI here. No, no, no. It's just bad. I'm just clicking I don't know it until we go through it. Really bad. Oh, and it's still come to the same question again. Oh, because it's then doing the entire question again. Right. I see. It kind of makes sense, but it's also way too much cognitive effort for the very first question in the app. It's a bad experience.

## Receptor question — individual cards and a separate visual

Okay, yeah, and the same problem for the next one: receptor to response. This makes sense. This is a nice question, but it should be a series of cards, right? Individual cards and individual questions. It should— every single thing should be easy to understand, to answer. The app is doing the breakdown. The reader should have to do nothing at all. They should just have a question. That's it. And then they answer it, or they say, I know it, or they, I don't know it, right? If they don't know it, you know, it gets shown to them. Or if they say, yeah, basically the answer gets shown to them next after that. And then, you know, they can say it was easy or hard or whatever. And if it's like a series of questions, yeah, we can have a diagram on the screen and show where we are in the diagram. That's it. And then a question, right? We should know this question: where is it in the diagram? The question doesn't need to be inside the diagram, though. That's terrible.

## Question formats and visual quality

It seems all of the questions are also in the same format right now, which is a problem. So the app is not usable yet. That's fine. We have more work to do. And in general, there's just a lot too much here. And the diagrams aren't good. Not very good anyway. You've built them out of HTML elements. They're basically just little cards and things. I want actually a visual experience, not just a website experience. And there's just too much text everywhere.

## Collate the conversation before changing the app

Before you do anything to the app! Collate all my dictations including the original one and the original prompt together please.

## Installation button wording

The button 'install kibra' needs to change to 'install app'

## Design phase and Design Echo request

I think the first version of the revision platform has ended up quite far from what I actually want. I've given you a lot of feedback and additional context since then, and rather than continuing to change the app incrementally, I'd like to step back and properly understand the design before we do more implementation.

Please spend some real time on that.

The first thing I'd like you to do is **record the useful information I've already given you about this project** somewhere durable in the repository. Go back through our conversation and collect the requirements, examples, things I've disliked, things I've liked, motivations, uncertainties, and any other context that seems important.

Please preserve the distinctions between things I have actually asked for and ideas or examples that were only exploratory. If I've contradicted myself or something is still unclear, that's useful information too — don't silently resolve it.

Then I'd like you to enter a design phase.

Use the design doctrine as the spirit of this work: step back from the implementation, think about what we're actually trying to achieve for the person using this, consider the concrete situations in which they'll use it, and allow yourself to explore the problem before settling on a solution.

The existing app shouldn't constrain you very much. It is useful evidence about what we've tried, but if the right design is substantially different, that's fine. Equally, don't redesign things just for the sake of redesigning them.

I'm particularly interested in the **actual user flows and product model**, rather than implementation details at this point.

Think through things such as:

- What does the learner see when they arrive?
- How do they understand what they need to learn?
- How do they decide what to do next?
- What does a very short revision session feel like?
- What does a longer session feel like?
- How do curriculum, topics, flashcards, exam-style questions, progress, weak areas and review fit together?
- What happens when they stop halfway through and return later?
- How does the system remain useful whether they spend five minutes or a large amount of time in it?
- What should feel visual, and what information does the visual structure actually communicate?
- Which concepts should be central to the product, and which things are merely features hanging off them?

Those are prompts for thinking, not a specification. There may be much better questions once you understand the problem.

Please feel comfortable exploring more than one possible shape for the product where that helps. I'm not looking for artificial "Option A / Option B / Option C" exercises; I just don't want us to lock onto the first plausible structure without noticing that there might be a substantially better one.

For this phase, **don't implement the redesign yet**. I want to be involved at the point where the product model becomes concrete.

When you've thought it through, give me a **Design Echo in chat**.

Make it plain and concrete rather than abstract design language. I want to be able to read it and say, "yes, that is what I meant" or point directly at where your understanding is wrong.

Please include:

- your current understanding of what this product is fundamentally for;
- the important requirements and constraints you've recovered from everything I've told you;
- the main concepts you think the product should contain and how they relate;
- the concrete user flows you currently imagine, from entering the app through doing useful revision and coming back later;
- how the curriculum/progression side and the actual revision/question side fit together;
- what the main screens or views might be, only insofar as they fall naturally out of those flows;
- the important design decisions you've made so far and why;
- places where you think my earlier feedback changes the direction of the existing app;
- anything you're still uncertain about or where you think my input would materially change the design.

It would be useful if you describe important flows almost like little walkthroughs:

> Kibra opens the site after placement with ten minutes available. She sees _____. She can immediately understand _____. She chooses _____. The system then _____. When she finishes or has to leave, _____. When she comes back tomorrow, _____.

That level of concreteness is much more useful to me than statements like "the interface should be intuitive" or "use a learner-centred dashboard."

The Design Echo does not need to pretend the design is finished. If thinking carefully reveals questions we should answer together, surface them.

The goal of this phase is simply to get our shared mental model right **before the ease of writing code pulls us into another implementation**.

Once you've given me the Design Echo, stop there and let me respond. We can refine the design together and then decide when it is ready to build.

## Correction — the teaching structure is entirely in the background

Sorry, the previous design exposed the teaching structure at all. The teaching structure shouldn't be exposed at all. It should only be guiding the learner. It's totally in the background. The entire teaching structure is in the background, right? The app is complicated under the hood, but it's very simple in the front. You just answer some questions. You see a question, you answer it to yourself, you click a button, you get the answer, you keep going, right? That's it. That's absolutely it. And the questions are best accompanied by visual things.

## Integrated Care opening focus, anxiety and harder authored preparation

Something else is that Kibra's stressed about the Integrated Care exam more than the pharmacology one, so you might have the app open to that at least for the first few days please. It's also a better test and a greater challenge to make the questions for that, because we don't have practices tests and previous exams - we have to guess the kinds of questions they will ask, and make sure we err on too hard rather than not hard enough to make sure she's prepared, but that will leave us with more total study material for that course because there'll be more concepts to build up to

## Course colours, confirmed buttons and direct prerequisite learning

you should aim for excellence eg. use a different color scheme for the different courses so one can know what's going on.

yes, I know it vs don't know it is important.

if "i don't know it" and there are are prerequisite cards then we step into those concepts directly instead of showing the full answer

## Concrete example — salbutamol, indication and candidiasis

like

Is salbutamol indicated for candidiasis?

I don't know it

What type of drug is salbutamol?

I don't know it

Salbutamol is ...

Next

What does "indicated" mean?

I know it

Indicated means ...

I was wrong

What is candidiasis commonly known as?

I know it

Medium

Is salbutamol indicated for candidiasis?

I know it

Hard

## Content-only screen and wordless visual relationships

There should be nothing else going on in the app. no text other than the content. but there can and should be images and clean animations and styling, beautiful diagrams (with no words) showing where one is in the chain above, as well as stock images in either the answers or the questions or both showing diseases and drugs and etc.

## Correction — DAG rather than chain

not a chain but a dag tho soz

## Multiple question types, readiness for full dictation and ordinary flashcards first

Also note, there's lots of different kinds of questions. So what we talked about there is an ordinary flashcard flow, but there could be a diagram or flashcards flow maybe for diagrams, and there could be a dictation for an open answer. Ideally, we can do some kind of sign in with ChatGPT flow for that. I don't know. But that's less important. That's like extra, because it's kind of cognitively demanding, which is not the point of this app. Even then, I'd say maybe, like, answer all the free form question, the quite complicated question, should do the conceptual breakdown as a whole bunch of flashcards, and finally when the person is good at those, they should then be prompted to do the full dictation answer and that would be the end. And, you know, if they got them all wrong, it's no point giving the full thing, even coming back to the full thing, you know, if it's cognitively demanding to just try to dictate out a full answer. Probably we should leave it. Only when the person's actually good at the sub-concepts and things, then we should bring them back to the full answer. But you should start with the full question, because then it gets— that motivates the flashcards, right? Not all things have a DAG, right? Some of them, and some of them can be multi-choice to mimic the actual exam questions. But if the person gets the answer wrong, then it should go into the flashcards maybe? Not sure. There's, like, lots of options here, and the point is, the interface is very, very simple, right? But there's a lot going on behind the scenes. But let's start with ordinary flashcards, like I just went through with you.

## Design Echo review — grounding, two visual layers, fresh sessions, eligibility and breadth

Okay, I'm just going to read through this and I'm going to give you my thoughts. So first of all, the design eco sentence you've written is great, yes. And yes, the ordinary experience is one question, useful visuals, and the answer controls. That's exactly right, yes. The words on screen, sure, but you're missing out images. The words on screen is a learning content. Well, the images are better learning content. Anything that should be learned should primarily be visual, if possible. But of course, not everything can be visual, and the words are, you know, important. But the point is grounding, right? A word, you know, calliphrygian, cassidosis, doesn't mean anything unless you've seen a picture of calliphrygian cassidosis, right? So ideally, trying to ground everything as much as possible is the point of this. The salbutamol question flow is perfect, yes. However, you've got something lower down in your design eco about resuming state, and I don't think that's right. I don't think that if you leave the app and come back to it, you should just be resumed straight away. I think that's disorientating to come back right into the middle of a prerequisite flow. I think it should be a fresh start on a fresh day. Then the answer controls, yes, that's good. Yep, you've got that understood correctly. The visuals, yeah, the point is that you need to understand where you are, but it should be really subtle, okay? So if you are a question with a prerequisite, we just have a little faded-out DAG picture, right? It's showing you subtly that it's a prerequisite structure question, and if you don't know it, it will highlight where you are in that little... that thing will become more prominent because you've now stepped into it, that DAG, and it will become more prominent and it will show where you are in it, and it will change. But it's separate to the visuals. It's not part of the learning visuals. It's different kind of visuals, that one. But the point is to show the overview shape of the learning, right? To show, and probably an animation is good. If you don't know it, it's going to step back, right? It's going to step back again. As you don't know it, I don't know it, I don't know it, you're going to step back, back, back further, and you're going to see the shape of the knowledge. That's the point. Just to show the stepping back process: I don't know it, it's stepping back. It's very subtle. It's just a little, you know, line... not a line diagram. I don't know what to call it. I don't want to over-prompt you. And anyways, then the actual images and, you know, domain diagrams, things are completely separate kinds of diagrams, right? Those are for the content as opposed to the learning structure. And yes, integrated care and pharmacology should have distinct color schemes and probably some kind of, like, pattern and something like that as well. Some kind of geometric pattern in the background or whatever. Different one. Right, yes. So now, because we lack integrated care past papers, to be an authored exam-style question, yes, grounded in the supplied material. Key point: grounded in the supplied material. So let's actually go through that and make sure you're getting grounded correctly when we get to those questions, and we should do that at least for one question, because that's what we need to test out here. And yes, she can immediately think about it. Yeah, and, you know, if she only has five or ten minutes, it's good. You know, she can stop at any time and just any amount of cards is good, read and understand the answer, then it's good, right? We focus on grounding, though. And we work like a normal flashcard app, in that we want to, like bring back cards at, like, an exponential forgetting schedule, or whatever it is, spaced repetition. And the thing is, we don't bring back cards unless we have got the prerequisites right at least once, if that makes sense. But we present the cards, we present the full question cards at least once, if that makes sense, and we bring them back once the prerequisite's been answered correctly on a, you know, yeah, we bring them back once they've been answered correctly. And yeah, I don't think we should necessarily just do, you know, I know it or I don't, but that's, like, the basic flashcard flow. But I think, like, multiple choice questions is a good idea. But for now, just flashcards is fine. But multiple choice is, like, even better, because then you actually know, and the app tells you if you got it right or wrong, you know, rather than you telling yourself. Anyways, yes, a quick reopening returns the exact state, but reopening the next day doesn't. Or even, like, probably, like, a few hours later it doesn't. It reopens fresh and gives you a new exam question, right? The point is to show you're learning, to show the learner that the learning is valuable. You need to show a real question, a real thing that will be answered on the real exam, and then break it down. Yeah, so then you're talking about how the curriculum guides the feed, what each assessment covers and how important the material is, correct? Which concepts support which questions, right? This should be obvious from your general knowledge. What camera has recalled, missed, or only answered after help? Exactly, yep. What needs review, what remains unstudied, and how much time remains. Yeah, that's right. And that's one of the reasons why I think that as time approaches, we should try to get, like, a broad overview of all the topics maybe, rather than, like, accidentally the app just, you open it every time you open it, it focuses you on the same shit over and over, and you don't move on to anything new. That would be a really bad experience, for example. Every time you open the app, it's the same question in front of you and you get it wrong every time. That would be a terrible experience. I've had that experience before with Anki. It's frustrating. When you open the app, you should feel good. That's why you're going to open the app again next time. Something easy, and something real, but not artificially easy. A real question from the real exam, but that's an easy one. Yeah, my time per mark idea is not, you know, 100%. Sorry, regarding your ambiguity. I liked the optional time question before starting. Sure, that makes complete sense to me, right? But, and now I only want content on screen. You're assuming there's only one screen. That's not the case. There's multiple screens. I told you earlier that the home screen makes perfect sense to have a home screen. But, you know, you don't have to show it except on the first run. And yeah, we can go back to the home screen somehow if we want, or to the learning curriculum overview screen if we build that in the future. But point is, when you open the app, the second time you open the app ever, then yeah, you can get that how much time do you have question. Perfect. It makes perfect sense to have that question. It's a really good question. The scheduler can use it, blah blah, and then you press it, one tap, now you're on a question, right? The right question, as the scheduler decides. It should be very responsive and fast. Nothing else on the screen. You gotta— maybe you got a secret, not a secret, but like a small home button up the top or something, or a small information button to show what's the, you know, provenance of this question, or whatever. But that's it. You shouldn't have any other text or anything going on.

## Parent return — first learning flow and later sessions

the parent returns the first time

just not again in a new session

## Trial direction — start on full questions every time

actually nah let's discard that rule I just said, let's just try it without that rule. we just start on the full questions every time for now. that's more stepping back which is good

## Prototype plan and delivery loops

Ok - excellent!!

Let's now make a plan for getting the app into a prototype state, please.

We'll do plan/review loop, then a build/testing/feedback loop, then finally a curriculum review loop because we need the whole curriculum in place before kibra starts using it tomorrow.

## Deadline — reply about the requested New Zealand ready time

5pm

## Availability — this build session and autonomous work afterwards

but I only have this build session available to be involved. so midnight today plus any autonomous work after that

## Plan approval — begin the build

Looks good. Let's start the plan, thank you.

## Prototype feedback — approved direction and refinements

Excellent. The app is way, way, way better. And I like your little diagrams, and the homepage is good. I still think it's a little bit weird to have the logo be K, and I think the logo should be, I don't know, maybe I'm wrong about this, should the logo not be, like, in the left-hand space, the left-hand margin space? On mobile it should come all the way into the main line, I guess, but on desktop, is which I'm using it on, it shouldn't. Yeah, no, I like it. How much time do you have? You click straight in. The little diagrams are good. I don't know what I know it. I think actually I've decided it should be I don't know and I know instead of I don't know it and I know it. And yeah, I think maybe I was wrong needs to be just one of the buttons, one of the options, you know? Like I was wrong, hard, medium, easy, you know? And easy is, like, highlighted weirdly. It's, like, a different color to the other options. That makes sense, I think. But maybe it should be, like, colors. You know? I don't know. Maybe that's tacky. You can figure it out. And one thing I was thinking is maybe we can have actual card animations. Not sure. What do you think about that? Let's just try it out, like a flipping card, like actual flipping card, you know? I think the question should show on both sides of the card, though. I like the diagrams. Some of them are a bit funky, but that's good. And the questions seem good. Can we go through the curriculum now? I actually think this app is, you know, usable. There's something a bit weird about the information, though. For example, I'm looking, Why use teach-back after a medicine explanation? Right? That's a good question, to ensure the person understands it. Then I click the information button, and the Health Literacy and Digital Empathy page 14. That's nice. Is that— what is that from? Stream? From the Stream downloaded content? Or from a textbook? Or what? And then use teach-back too. Don't just give written. Try to avoid giving too required, and provide hands-on, or ensure patients have information. Discuss it, much information at information ND. I don't understand what the hell that is. Sorry. Anyways, that's not important. The source is nice to know, though. I just clicked that because I was clicking around. Yeah, and honestly, it's quite good. I like it a lot. I haven't tested out the, like, restarting or something like that. Yeah. It's honestly really good. You might increase the text size for the answer. I'm not sure. I was thinking maybe the dots should flow along the lines. I don't know if that's too hard to achieve or not. In the diagram, the little, in the, like, status diagram, maybe the dots should flow along the lines. If that's too hard to achieve, don't worry about it. It's good. And for the half-life question, I like the little dots, maybe like a graph. A graph is the more canonical way to show a half-life, but yeah. Actually, the dots is quite good too. More visual, you know? And I've just seen that, yeah, when you go back home and then you keep going around, you actually get the individual, you know, cards from your when you stepped back down into deeper concepts from one of the questions. The individual cards come up by themselves, which is nice. I think that's how I wanted it originally. But then I guess you can, like, get the full question later on, right? Yeah, you can. And if I say I was wrong, oh yeah, it's gonna bring me back down into the questions. Nice. I like it a lot. Nice. Oh no, I finished the cards. Oh cool. Cool. Honestly, it's working really, really well.

## Product name — separate from the learner’s name

Yeah, and the app can't be called Kibra. The app has to be called Study Help or something.

That's a bad name. Choose a better one.

## Curriculum review — account recovery and cost preference

The curriculum reviewers should have been, should be working now. The account usage limit was already hit and is fixed now. I recommend using cheaper sub-agents. The curriculum review is quite a large task and it's not that important, especially for reviewing it.

## Interactive curriculum review for Max

Yeah, and I want some kind of admin page, so I can view the full curriculum. Once you've finished building and reviewing the full curriculum, then please build me a page so I can do the same interactively. Again, relax and step back to the design principles. What do I need to know? What do I need to see in order to be confident that you've correctly understood the end goal of this app and chosen all of the curriculum correctly, aiming to get the user up to speed with the actual content that's likely to be in the actual exam. I would like to see a model of what's likely to be in the tests, and then coverage of all of those topics, and explanations of why the content in the app is going to cover those topics enough to get the user up to date—not up to date, but, like, you know, good enough to pass and do well at the exams.

## Completion evidence — breadth, depth, quality and accuracy

I want at least four things to be demonstrated. And if they're not demonstrated, we need to achieve them before we call this done. Breadth, depth, quality, and accuracy. First is breadth of the course content. I want to ensure everything is covered. Then depth: is everything covered in such a way that it can actually be learned from this app? Then quality: how easy is it to learn from this app? How high quality are the cards? Are they appropriately small, easy to understand, well written, visual? How well broken down are the dependencies? And then last, accuracy: is all the information correct? Are the sources clear and useful, so I can see where on the original Stream site or which course resources were used to build this (or if it came from general knowledge - which is fine!)

## How to demonstrate the four dimensions

Importantly, I don't actually know everything that should be in the exam. So I need you to argue from the breadth of the content that's available, what the scope of the exam will be, and then demonstrate that everything in that scope is in the curriculum. For depth, I don't know what every detail of every medication is. So I need some representative examples, and then I want there to be asserted that all of them have been treated similarly. Quality, again similar process, representative examples, and, you know, what have we done to ensure that the learning experience is really, really good? And that often means less is more. Putting work into making the question well written, small, easy to understand, choosing good pictures, checking the diagrams are good, doing diagrams whenever possible. And then lastly, accuracy. This is less— this is easier for me to check. I just have to look at a representative sample and, you know, check that the stuff is accurate. Just check that it's easy for me to understand the chain of things that led this card or thing to be in the curriculum. For example, you know, which test justifies this being in scope, what topic it is, what the original source from the content archive, or whether it was, you know, a source added by the agent, and then is it linked to any other cards or anything like that.

## Exhaustive inventory, proposed exam scope and curriculum coverage

You should specifically aim for exhaustiveness. That's often what I want to know. So you can give me an exhaustive list of categories of course content, and then point out specific parts that are useful and why, to then give me an exhaustive scope for the exam content, right? Then give me an exhaustive, you know, categorization or list of the, you know, curriculum items you've put in to cover that. That makes sense. I think that will be quite helpful if you aim for exhaustiveness, even if the exhaustiveness is gamed by having an other category with a bunch of examples in it. That's fine.

## Integrated Care — diversity of plausible exam questions

I've got one more thing I need to show on, which is that I want you to have built a model of example questions for the Integrated Care exam. And it should be like a distribution of different kinds of questions that could possibly come up, and how the app is going to prepare one to answer such questions. Because we don't have a practice exam for that, so we need to prepare for a diversity of different questions.

The app should answer. Sorry, the review or the curriculum overview page should answer how the app will prepare one to answer such questions, even though we don't know exactly what they are.

## Exemplar testing — pause curriculum work

All right, I realised the curriculum overview can't explain that yet. So it's futile right now because we didn't support different kinds of questions yet. So you should have told me that straight away, sorry. I'm asking for something in the wrong order.

Actually no. Let's do one example of every different type of question, please, right now. Pause your work on the curriculum. I want to just do a test of a single one of every different type of question that you're going to make, please. An exemplar.
