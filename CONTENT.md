# Curriculum and sources

Practice follows the ten chapters and section objectives of the 2026 Pharmacology guide, and the six Integrated Care teaching weeks and labs. Every question carries its course, topic, concepts, prerequisite questions and page/slide references with evidence excerpts. The source catalogue records original filenames and SHA-256 hashes. Raw course captures and private session metadata are excluded from deployment.

## Assessment alignment

Integrated Care A5 is a two-hour paper test on 29 October 2026, 10:00–12:00 NZDT, worth 40%, with MCQ, true/false and short answers. Its five outcomes cover integrated care, Te Tiriti-led cultural safety, assessment and nursing interventions, equity, and primary health care. The supplied teaching guidance explicitly tests the 2025 immunisation schedule and says older-adult/cancer material may appear. Portfolio, placement and safeMedicate requirements are separate assessments.

Max supplied the Pharmacology final as “50% Nov 2” and confirmed long answers. The guide identifies its section objectives and Drugs to Know as expected knowledge that may be examined, and recommends its revision questions and provided answers for final-exam study. The current final’s start time, duration and section mark split are not supplied. Historical questions display their year and original marks; their answer guides are course-derived rather than official paper marking keys.

## Authoring and review

The prototype feed uses the eight `studyRootIds` in `data.json`, with 24 reachable question cards; the full collection remains available for curriculum review and saved-progress compatibility.

Use the supplied current guide/lecture/lab content first. Check the actual PDF page or slide, including image and SmartArt content, rather than relying on extraction alone. A source excerpt must exist on the referenced page and support the answer. Preserve source qualifiers. Do not import unanswered quiz attempts as an answer key. Older mindmaps are marked outdated in the course pages and need current corroboration.

Ground learning in accurate subject images wherever useful. Use a chain for a genuine sequence, a timeline for time or age, a comparison for alternatives, and a person/whānau map for parallel care domains. These content visuals serve a different purpose from the subtle wordless prerequisite DAG. Keep each ordinary question clear and its answer concise. Larger written cases can carry the reasoning needed for later exam practice.

Record coverage limits for authors and on-demand source information. Missing textbooks and external teaching links cannot supply answers; conflicting or clinically questionable statements require an accuracy check before teaching. These limits affect coverage, so counts of practised questions are not a predicted exam score.

## Reviewed grounding example

The prototype's opening Integrated Care flashcard asks one directly testable schedule fact.

**Question:** At the six-week immunisation visit, which vaccine is given by mouth?

**Answer:** Rotarix — the oral rotavirus vaccine.

| Evidence | What it establishes |
| --- | --- |
| Immunisation Lab — Pre-Learning, “NZ Immunisation Schedule”: “Please know the 2025 NZ Immunisation Schedule here:” followed by “(You will be tested on this for your knowledge test, so please download it!)” | The course explicitly makes this schedule testable. It does not supply this exact question. |
| National Immunisation Schedule, August 2025, PDF page 1: the six-week row pairs “Rotavirus” with “Rotarix® (oral)”. | The vaccine, disease and route in the answer are directly supported. |
| Same PDF, page 2: the six-week row says “RV1 oral vaccine (Rotarix®)” and shows the actual package and oral tube. | The product photo grounds the name and form. Its printed route supports the answer, but would give it away on the question face. |

Use the original Rotarix photograph on the answer face, alongside the short answer. The question face should not show the package’s “For Oral Administration Only” wording. The photo teaches what the named product looks like; it does not teach every vaccine fact. This standalone fact needs no manufactured prerequisite DAG.

The wording is authored practice based on explicitly testable material. It is neither a past-paper question nor evidence that this exact item will appear. It tests the supplied August 2025 schedule; it does not assert that the schedule is unchanged in 2026. The course text, both rendered PDF pages and the extracted product photograph were inspected.

Source catalogue entries:

- `raw-stream-html/linked-pages/a50f1bd3fa57-NZ-Immunisation-Schedule.html` — SHA-256 `a538e3adcf104b484512a0e0a83ac5040c055a4bef1d13f7fa72a5278c306b7f`.
- `raw-stream-files/9dd756fa9ece-NIP8860_Immunisation_Schedule_Card_v20_WEB.pdf` — SHA-256 `50f5cb634c8e64e1e9be6b1c7ae42751e93f909525d9716bf61b5032b388035d`.

## Integrated Care application exemplar

`medicine-teach-back` asks: “A person nods during your medicine explanation but cannot tell you how to take it at home. What should you do next?”

The authored answer applies the supplied Health Literacy & Digital Empathy lecture: explain again in plain language, use teach-back, and adapt the explanation until understanding is clear; slide 14 specifies plain language and teach-back, and slide 3 shares responsibility with providers and services.

Its two supporting questions ask why teach-back is used and who shares communication responsibility; both can step back to the meaning of health literacy, so the supporting graph contains a shared concept rather than an artificial sequence.
