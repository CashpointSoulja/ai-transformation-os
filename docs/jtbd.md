# Jobs to be done

I used GitLab's own JTBD format from the handbook (based on Jim Kalbach's *JTBD Playbook*): a **main job** written as verb + object + clarifier, broken into **small jobs**, with job stories underneath.

## Primary: the AI Transformation Owner

**Main job:** *Turn a function's scattered AI demand into a prioritized, owned portfolio that measurably moves its business metrics.*

| Small job | Job story | Where the product does it |
|---|---|---|
| Capture demand | When someone in the function has an AI idea or pain point, I want it in one place in their own words, so nothing is lost in Slack. | Intake |
| Qualify a use case | When a request comes in, I want to know which workflow it touches and how big the prize is, so I can tell a real opportunity from a nice-to-have. | Triage: workflow, 100x potential |
| Consume before build | Before committing build time, I want to know whether a skill or agent already covers this, so the library compounds instead of fragmenting. | Triage: effort adjustments, reuse label |
| Prioritize against outcomes | When I plan the next milestone, I want a ranked list weighted by this half's outcomes, so priorities stop churning. | Backlog, tiers, outcome weights |
| Defend the call | When an exec or a requester asks why something is (or isn't) next, I want a two-sentence answer with the evidence behind it. | Rationale and reasoning trace |
| Route what isn't mine | When a request is really a platform bug or access problem, I want it sent straight to the Hub, so it doesn't sit in my queue. | Hub routing |
| Own the fleet | When an agent is running in my function, I want to know who owns it, whether it passes its eval and whether it ran today, so nothing operates unaccountably. | Fleet registry |
| Close the adoption gap | When I plan coaching time, I want to see which sub-teams lag and whether they have a Champion, so my time goes where the gap is. | Champion hub |
| Make wins contagious | When a team ships something, I want every other team to see it and reuse it. | Demo wall, skills library |
| Report value | Each quarter, I want shipped use cases, adoption and hours returned on one screen for the QBR. | Overview |

## Secondary: Product & Design team member

**Main job:** *Get a repetitive part of my week taken off my plate without becoming an AI expert.*

- When something tedious eats my week, I want to describe it in plain words and know someone read it, so I don't give up and keep doing it by hand.
- When I raise a request, I want to see where it landed and why, so I trust the process even when it isn't first.
- When another team has already solved my problem, I want to find their agent or skill and use it today.

## Secondary: Champion

**Main job:** *Help my sub-team adopt AI where it pays off, in 5–10% of my time.*

- When teammates bring me ideas, I want a place to send them that does the first-pass qualification for me.
- When my team ships something, I want it on the demo wall with its numbers, so my team gets credit and others copy it.

## Micro-jobs the trace makes visible

For the triage agent's own job ("decide where this request goes and why"), each step of the reasoning trace is a micro-job:
read → extract workflow → size volume/frequency/pain → estimate effort → group into theme → rank → write rationale.
Showing every micro-job is what makes the decision trustworthy.
