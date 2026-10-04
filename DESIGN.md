# Product design under discussion

This proposal prepares Kibra to answer her nursing exam questions confidently while making ordinary revision easy to begin, easy to continue and safe to interrupt. It follows Max’s latest correction: the teaching structure guides the learner entirely from the background. Max is reviewing the product model before redesign implementation.

## Product model

The learner’s product is a continuous question feed: see one question, answer mentally, use “I know it” or “I don’t know it”, continue. The screen has the content, these functional controls and useful visuals. Curriculum planning and teaching decisions are in the background.

The hidden model connects assessments and their source-defined scope to the knowledge needed for exam performance. Where dependencies exist, concepts form a directed acyclic graph: shared knowledge can support several questions and more than one idea can support a question. Other questions stand alone. Several prompts can test knowledge through recognition, unaided recall, explanation, comparison and clinical application. Relationships help the app respond to a gap; review history helps it choose when to ask again.

Courses, topics, prerequisites, weak areas and review queues guide the app’s decisions. A subtle wordless DAG provides orientation while it steps back into prerequisite questions. The domain images and diagrams separately ground the content being learned. The learner answers questions while the app handles routing and planning.

An ordinary card asks one clear thing. Its answer is concise and sufficient to learn that thing. A short exam vignette can require meaningful reasoning without becoming an essay. Ordinary flashcards are the first flow to design and build after agreement; diagram interaction, multiple-choice assessment and full dictated answers can extend it later.

## Learner flows

**Arrive.** First use can show a minimal home screen. Later fresh sessions open with “How much time do you have?”; one tap opens a full question chosen by the scheduler. For now, every fresh session starts on a full question, with supporting concepts reached by stepping back when needed. It should feel immediate. A quick reopening resumes the current card. A small home control can return to home, and a small information control opens provenance on request. A curriculum overview is possible future work. The content-only requirement applies to the study screen.

**Answer.** The question is prominent and separate from its visual. Recall is mental by default. “I know it” reveals this card’s answer, then gets Hard/Medium/Easy and “I was wrong”. Choosing one advances the feed. These labels follow Max’s latest example; the distinction between “I know it” and “I don’t know it” is explicitly confirmed.

**Do not know.** If there are prerequisite cards, “I don’t know it” immediately opens the next relevant prerequisite question and keeps the full answer hidden. The same two-button interaction applies at every depth. At a question without prerequisites, it reveals that answer and offers Next. The wordless structure visual gently becomes more prominent and highlights each step back. After the supporting cards, the original question returns as an ordinary card, including when some supporting answers were missed. Returning after help is useful reconstruction, not evidence of later independent recall.

Max’s salbutamol/candidiasis example anchors this sequence: an unknown application question leads to drug type, the meaning of “indicated”, and the familiar name for candidiasis, then returns to the original question. An unknown drug-type card reveals its answer and Next. A known definition can be corrected with “I was wrong”; another concept gets Medium; the original gets Hard. This is illustrative, not a prescribed opening or a fixed prerequisite count.

**Ten minutes after placement.** Kibra taps her available time. During the first few days, a fresh feed opens with Integrated Care because that exam worries her more. The scheduler chooses an approachable exam-relevant question that lets her experience valuable learning. If she needs prerequisites, the feed steps into them. Later questions can cover other topics and Pharmacology. She can stop after any card; reading and understanding an answer is useful progress.

**Five unexpected minutes.** A few manageable questions produce useful review or new learning. The app avoids opening a large written task. Nothing has to be completed to make the session count, and no minimum session length is implied.

**A longer weekend session.** The same feed continues through more review, new knowledge and application questions. Closely related questions can stay together when they build an explanation; the scheduler switches to other high-value material between these runs. A longer session should test increasingly integrated reasoning, rather than repeat more recognition questions.

**Larger answers later.** Max’s exploratory model shows a full open question first to give the concept cards a purpose. It asks for the full dictated answer only after the learner is good at the relevant concepts. Struggling through all the concept cards does not trigger a compulsory full answer; that demanding task remains for later. Presenting the motivating question and demanding the full response are separate actions. The exact readiness criterion, diagram-question interaction and route from an incorrect MCQ into concept cards need later design. ChatGPT sign-in is an unsettled, lower-priority idea for this extra flow, not part of the ordinary-card requirement.

Integrated Care questions must be authored from assessment outcomes and supplied teaching because its practice tests and past papers are unavailable. Preparation should err toward demanding application and broad enough supporting understanding, while each individual question remains clear. A larger authored question collection is not proof that every item is assessed or deserves equal study time. Authored exam-style prompts and authentic Pharmacology past-paper prompts retain different provenance in source details.

**Leave and return.** A quick reopening resumes the exact card and reveal state. A new day starts a fresh session; probably a gap of a few hours should do so too. The precise same-day threshold is unset. Fresh sessions ask available time and choose a new exam-relevant opening rather than dropping the learner into yesterday’s prerequisite work. Attempts, knowledge evidence and spaced-review history persist; the navigation position expires. If an exam has passed, new work comes from the remaining course.

**Install.** “Install app” is a quiet, optional action outside the learning task. On iPhone it opens short Share → Add to Home Screen guidance, rather than depending on a browser installation prompt. It does not interrupt the first question automatically. Actual progress continuity between Chrome, Safari and the installed app needs verification on Kibra’s device; do not promise it from desktop testing.

The front-facing views are first-run home, fresh-session time selection, and the question’s unrevealed/revealed states. Source details and installation instructions open on demand. The study screen contains learning content and answer controls, with small home/information access.

## Visual meaning

There are two separate visual purposes.

**Ground the subject.** Images and domain diagrams are primary learning content wherever they can explain what is being learned. A medicine name connects to its actual packaging or administration form; a condition connects to a medically appropriate image; a mechanism connects to the relevant anatomy and change. Words supply the question and facts that the image cannot convey. Social and care concepts need equally deliberate grounding in concrete situations and relationships; a generic stock photograph is not automatically useful teaching.

These visuals can appear on the question, answer or both. The front must retain useful context without giving away the tested fact. The answer can reveal a missing relation or animate a mechanism. Related cards can reuse a recognisable subject illustration and change its focus. Visual selection must check clinical accuracy, what the learner can actually infer, and answer leakage. The question remains separate from the diagram.

**Orient within prerequisite work.** A small wordless DAG shows the shape of the supporting knowledge. On the initial question it is faded and unobtrusive. Choosing “I don’t know it” makes it a little more prominent and gently moves the highlight back to the prerequisite now being asked. Further unknowns show further steps back. This is a quiet positional cue, with no labels, navigation task or explanation to read. Its purpose is to make the stepping-back process visible; it is separate from the subject’s image or medical diagram. Standalone questions need no invented graph.

Each course has a distinct colour scheme while the layout and controls remain consistent. Max also suggested probably using different geometric background patterns; their exact form remains exploratory. Any pattern must remain quiet enough for the content to dominate. Course identity should be recognisable without relying on colour alone. Correctness and recall difficulty must not be confused with course colour.

The reviewed Integrated Care example in [CONTENT.md](CONTENT.md) connects a directly testable schedule fact to the actual vaccine photograph. It also demonstrates why image placement matters: the package says “For Oral Administration Only”, so showing it before a route question would reveal the answer.

## Allocation and learning evidence

There are two different hidden decisions: when particular knowledge needs another retrieval attempt, and which activity offers the most value now across the assessed curriculum. FSRS is useful for the first; exam dates, importance, gaps, content remaining and time available matter to the second. A spaced-review date alone is not an exam-preparation plan.

For now, fresh sessions start on full questions. Supporting-card results inform which concepts need teaching or review; the full question can return during its initial learning flow and in later sessions. When it returns, an unknown answer can lead back into the supporting concepts again. Recall ratings and spaced repetition guide review timing. Merely seeing an answer, choosing Next or correcting a wrong self-assessment records learning or a miss rather than correct independent recall.

Coverage needs deliberate attention alongside weak-area review. Fresh openings should vary and favour approachable exam-relevant questions; an unresolved hard card must not become the opening every time. The feed must also introduce important unstudied material, with increasing attention to broad assessment coverage as the exam approaches. A larger authored deck must not win time merely by containing more cards.

The 40:50 assessment weights inform allocation across the whole period. Max has qualified time per mark as a useful idea rather than a rigid target. Remaining assessed material, understanding, review needs and a useful opening experience can change the mix. Time available after the first exam belongs entirely to Pharmacology and therefore matters when deciding the earlier mix.

Actual session lengths should update rough future-capacity assumptions. Placement evenings, weekends and any study day can have different capacities. No precise values have been supplied. Unpredictable time and impossible full coverage require choosing the most useful next questions, rather than assuming a daily lesson can always be completed.

Kibra’s greater Integrated Care anxiety adds an initial opening preference and a reason to build supported confidence there. The first few days’ opening should use that course; the rest of the feed still balances both exams. Its potentially larger body of authored material requires prioritising assessed concepts, not mechanically allocating by card count.

Recognition, unaided recall and application provide different evidence. A correct MCQ guess or an immediate answer after explanation cannot prove later independent recall or full exam readiness. Important ideas need later retrieval, changed wording and application. Progress is chiefly expressed by the app choosing better questions; raw card counts and a predicted exam percentage are not needed on the learning screen.

## Product shapes considered

Course-map launch, assigned daily lessons and integrated-exam-first study were compared with a continuous feed against short tired sessions, interruption and sustained exam preparation. Map navigation exposes planning work; daily lessons impose completion boundaries; large exam-first tasks reproduce the opening difficulty Max observed. A plain independent-card queue is easier to use but cannot, by itself, repair causal understanding or ensure exam transfer.

The proposed integrating idea is a continuous feed backed by curriculum-aware teaching: the interface stays constant while question selection changes to review, introduce, clarify or test application. Coherent related questions can stay together without becoming a visible lesson. This is a product proposal for Max to correct, not an approved specification.

## Decisions needing Max’s input

A quick reopening resumes and a new day starts fresh. Max tentatively extends fresh starts to a few hours away; the exact same-day threshold remains unset. Future weekday/weekend study capacity is a rough planning assumption, not a required setup questionnaire; its concrete values remain unknown.

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
