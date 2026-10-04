# Product design under discussion

This proposal prepares Kibra to answer her nursing exam questions confidently while making ordinary revision easy to begin, easy to continue and safe to interrupt. It follows Max’s latest correction: the teaching structure guides the learner entirely from the background. Max is reviewing the product model before redesign implementation.

## Product model

The learner’s product is a continuous question feed: see one question, answer mentally, use “I know it” or “I don’t know it”, continue. The screen has the content, these functional controls and useful visuals. Curriculum planning and teaching decisions are in the background.

The hidden model connects assessments and their source-defined scope to the knowledge needed for exam performance. Where dependencies exist, concepts form a directed acyclic graph: shared knowledge can support several questions and more than one idea can support a question. Other questions stand alone. Several prompts can test knowledge through recognition, unaided recall, explanation, comparison and clinical application. Relationships help the app respond to a gap; review history helps it choose when to ask again.

Courses, topics, prerequisites, weak areas and review queues are information for the app to act on. The learner does not choose a course, inspect a curriculum browser, select a learning phase or complete a prerequisite checklist. A wordless DAG can show the current question’s place among connected ideas while routing through those ideas remains the app’s job.

An ordinary card asks one clear thing. Its answer is concise and sufficient to learn that thing. A short exam vignette can require meaningful reasoning without becoming an essay. Ordinary flashcards are the first flow to design and build after agreement; diagram interaction, multiple-choice assessment and full dictated answers can extend it later.

## Learner flows

**Arrive.** Opening goes directly to a question or the saved question state. Max liked a prominent optional time question before studying; its place needs agreement given the latest content-only direction. If used, choosing an amount or skipping must lead directly to content, without a separate Start screen.

**Answer.** The question is prominent and separate from its visual. Recall is mental by default. “I know it” reveals this card’s answer, then gets Hard/Medium/Easy and “I was wrong”. Choosing one advances the feed. These labels follow Max’s latest example; the distinction between “I know it” and “I don’t know it” is explicitly confirmed.

**Do not know.** If there are prerequisite cards, “I don’t know it” immediately opens the next relevant prerequisite question and keeps the full answer hidden. The same two-button interaction applies at every depth. At a question without prerequisites, it reveals that answer and offers Next. There is no “Build the understanding”, “Piece 1 of 4”, parent task or return-to-the-whole stage on screen. After the relevant concepts, the original question returns as an ordinary card. Returning after help is useful reconstruction, not evidence of later independent recall.

Max’s salbutamol/candidiasis example anchors this sequence: an unknown application question leads to drug type, the meaning of “indicated”, and the familiar name for candidiasis, then returns to the original question. An unknown drug-type card reveals its answer and Next. A known definition can be corrected with “I was wrong”; another concept gets Medium; the original gets Hard. This is an illustrative sequence, not the opening lesson or a rule that all questions require exactly three prerequisites. The earlier rejected experience began with an oversized task and exposed its teaching stages; the proposed sequence keeps each question individually manageable.

**Ten minutes after placement.** Kibra indicates ten minutes. During the first few days, the feed opens with Integrated Care because that exam worries her more. A short authored exam-style MCQ asks one care decision. If she does not know it, the feed moves directly to the concepts needed for that decision. When a small line of reasoning is complete, the app can select Pharmacology without announcing a course block. Near the chosen time, a quiet pause/continue choice is offered at an answer boundary; there is no unfinished daily lesson.

**Five unexpected minutes.** A few manageable questions produce useful review or new learning. The app avoids opening a large written task. Nothing has to be completed to make the session count, and no minimum session length is implied.

**A longer weekend session.** The same feed continues through more review, new knowledge and application questions. Closely related questions can stay together when they build an explanation; the scheduler switches to other high-value material between these runs. A longer session should test increasingly integrated reasoning, rather than repeat more recognition questions.

**Larger answers later.** Max’s exploratory model shows a full open question first to give the concept cards a purpose. It asks for the full dictated answer only after the learner is good at the relevant concepts. Struggling through all the concept cards does not trigger a compulsory full answer; that demanding task remains for later. Presenting the motivating question and demanding the full response are separate actions. The exact readiness criterion, diagram-question interaction and route from an incorrect MCQ into concept cards need later design. ChatGPT sign-in is an unsettled, lower-priority idea for this extra flow, not part of the ordinary-card requirement.

Integrated Care questions must be authored from assessment outcomes and supplied teaching because its practice tests and past papers are unavailable. Preparation should err toward demanding application and broad enough supporting understanding, while each individual question remains clear. A larger authored question collection is not proof that every item is assessed or deserves equal study time. Authored exam-style prompts and authentic Pharmacology past-paper prompts retain different provenance in source details.

**Leave and return.** The learner can stop before revealing, while reading the answer, or after rating. The app preserves that exact state. Reopening soon resumes it without another setup flow. After a longer absence, unfinished work remains available, but old completed answers do not become a false record of new recall. If an answer was already revealed, returning to it is still reading the answer, not passing a new test. If its exam has passed, the app moves to the remaining course. No missed-day debt screen is required.

**Install.** “Install app” is a quiet, optional action outside the learning task. On iPhone it opens short Share → Add to Home Screen guidance, rather than depending on a browser installation prompt. It does not interrupt the first question automatically. Actual progress continuity between Chrome, Safari and the installed app needs verification on Kibra’s device; do not promise it from desktop testing.

The ordinary front-facing views are the question’s unrevealed/revealed states. Source details and installation instructions can open on demand; an optional time control needs review. A dashboard or course browser is not needed for this proposal.

## Visual meaning

A useful visual communicates a place, relationship, change or comparison. The DAG is wordless: images and meaningful symbols represent the ideas, connections show how they support one another, and a highlight shows the current focus. The question and answer stay outside the diagram. It is neither a text-card grid nor a compulsory linear chain.

Show the relevant neighbourhood of that DAG, not the entire curriculum. Shared concepts retain a recognisable visual identity across questions. The learner gets context and position without navigating nodes or reading an explanation of the graph.

In the salbutamol/candidiasis example, visuals can identify the medicine, the condition and the treatment relationship. The focus moves between those ideas while the visible question supplies the words. A concept learned here can also support another question later. Drug pathways, anatomy and care relationships can use suitable subject illustrations within this visual model.

Each course has a recognisably different colour scheme while the layout and controls remain consistent. Green for Integrated Care and violet for Pharmacology are illustrative palette choices, not specified colours. Colour identifies the subject; it does not indicate correctness, difficulty or a curriculum stage. Course identity also remains accessible to people who cannot distinguish those colours.

The front gives necessary context without revealing the fact being tested. The answer can complete a connection or show a mechanism through a clean, restrained animation. In related questions, the same diagram stays recognisable while its focus changes. Stock or source images of diseases and drugs can appear on the question, answer or both where they help learning; image selection and clinical meaning need deliberate checking. The diagram itself has no written labels.

The 2019 paper’s salbutamol classification MCQ is a concrete Pharmacology example. A receptor/airway image must not show an agonist activation label before this answer is revealed. After reveal, the answer can connect selective beta-2 agonism to the taught airway effect. A later question without those choices checks recall rather than recognition alone. The opening focus is Integrated Care, not this Pharmacology example.

## Allocation and learning evidence

There are two different hidden decisions: when particular knowledge needs another retrieval attempt, and which activity offers the most value now across the assessed curriculum. FSRS is useful for the first; exam dates, importance, gaps, content remaining and time available matter to the second. A spaced-review date alone is not an exam-preparation plan.

The assessment-weight baseline is 40:50 across the whole period, not a permanent session split. Illustratively, if there were 18 study hours left and four occurred after Integrated Care, an equal-time-per-weight-point starting allocation would give Integrated Care eight hours and Pharmacology ten. Before the first exam this means eight hours and six; the later four all go to Pharmacology. These are hypothetical numbers, not a forecast of Kibra’s availability. Differences in understanding and remaining assessed material can change the allocation.

Actual session lengths should update rough future-capacity assumptions. Placement evenings, weekends and any study day can have different capacities. No precise values have been supplied. Unpredictable time and impossible full coverage require choosing the most useful next questions, rather than assuming a daily lesson can always be completed.

Kibra’s greater Integrated Care anxiety adds an initial opening preference and a reason to build supported confidence there. The first few days’ opening should use that course; the rest of the feed still balances both exams. Its potentially larger body of authored material requires prioritising assessed concepts, not mechanically allocating by card count.

Recognition, unaided recall and application provide different evidence. A correct MCQ guess or an immediate answer after explanation cannot prove later independent recall or full exam readiness. Important ideas need later retrieval, changed wording and application. Progress is chiefly expressed by the app choosing better questions; raw card counts and a predicted exam percentage are not needed on the learning screen.

## Product shapes considered

Course-map launch, assigned daily lessons and integrated-exam-first study were compared with a continuous feed against short tired sessions, interruption and sustained exam preparation. Map navigation exposes planning work; daily lessons impose completion boundaries; large exam-first tasks reproduce the opening difficulty Max observed. A plain independent-card queue is easier to use but cannot, by itself, repair causal understanding or ensure exam transfer.

The proposed integrating idea is a continuous feed backed by curriculum-aware teaching: the interface stays constant while question selection changes to review, introduce, clarify or test application. Coherent related questions can stay together without becoming a visible lesson. This is a product proposal for Max to correct, not an approved specification.

## Decisions needing Max’s input

The immediate open choice is whether the earlier optional time question still belongs at the start, or time should be adjustable only on request so the app opens directly to content. A rapid reopening should resume the current card directly. Future weekday/weekend capacity is a rough planning assumption, not a required setup questionnaire; its concrete values remain unknown.

For later flows, the readiness threshold for full dictation, diagram interaction, incorrect-MCQ routing and any ChatGPT sign-in remain exploratory. They do not need to be settled before the ordinary flashcard flow is agreed. Pharmacology long answers are confirmed; larger Integrated Care short answers are likely. Concept recall supports those answers but cannot alone prove complete timed written performance.

## Research and source evidence

- [Anki studying](https://docs.ankiweb.net/studying.html): question first, mental recall, reveal, feedback and continuation. Its deck navigation and study overview are not proposed for this product.
- [RemNote spaced repetition](https://help.remnote.com/en/articles/6022755-getting-started-with-spaced-repetition): a global practice queue can select urgent material across topics; mental answers are the normal interaction.
- [RemNote small questions](https://help.remnote.com/en/articles/8709623-writing-atomic-flashcards): independently answerable questions avoid ambiguous self-grading of a large fact bundle.
- [RemNote visual recall](https://help.remnote.com/en/articles/6511625-image-occlusion-cards) and [related cards](https://help.remnote.com/en/articles/10104223-card-clusters): hide the tested information while retaining useful visual context; related questions can retain context without re-testing everything.
- [RemNote exam preparation](https://help.remnote.com/en/articles/9101991-preparing-for-an-exam): exam-date scheduling needs new-material introduction and final review as well as normal spaced repetition. Its visible planning/setup screens are not proposed here.
- [Brainscape](https://www.brainscape.com/spaced-repetition): mental retrieval, post-answer confidence, and a curated mix of subjects. Its promotional effectiveness claims were not independently tested; its dashboards, streaks and leaderboards are not design requirements.
- [Chrome on iPhone](https://support.google.com/chrome/answer/9658361?hl=en&co=GENIE.Platform%3DiOS) and [Apple Home Screen guidance](https://support.apple.com/en-nz/guide/iphone/iph42ab2f3a7/ios): installation uses Share → Add to Home Screen; Safari is a fallback if the action is unavailable. Device-specific progress continuity remains unverified.
- Supplied archive: `pharmacology-old-exams/214202_DISD_MTUB_AKLB_WLGB_19S2F2.pdf`, PDF page 2, question 4: “Salbutamol is a/an” with blocker/agonist/antagonist/inhibitor choices. Answer support comes from the 2026 Pharmacology guide, PDF page 127, which identifies salbutamol as a selective beta-2 agonist. The historical paper is not evidence of the current final’s exact section structure or an official answer key.

Read [CONTENT.md](CONTENT.md) when checking actual assessment scope and medical-source limitations, and [REQUIREMENTS.md](REQUIREMENTS.md) when distinguishing Max’s requests from this proposal.
