# Problem description

I want to build relations tracking application called "emmaCompanionship" that helps people responsible for maintaining relationships and dialogue between people (community members) in these relationships. 
We have three types of people involved in those relations: couples (married people), consecrated persons (priests, deacons, seminarians, monks, nuns, consecrated sisters, consecrated brothers), single people.  
We have four types of relation here: "accompanying" (person or couple who accompanies other person/couple) and "accompanied" (reverse relation: person or couple being accompanied by his/her/their companion(s)), 
and "supervising" (person supervising other person), and "supervised" (reverse relation: person being supervised by other person). There are following constraints here:
1. companionship follows gender: men accompanies men, woman accompanies woman
1.a. for couples it means: either they meet 2:2 (couple with couple) or 1:1 (husband with husband, wife with wife) but never accompanying husband with accompanied wife nor accompanying wife with accompanied husband
1.b. for consecrated persons it means: either consecrated men accompanies consecrated men (and accordingly: consecrated women accompanies consecrated women) or 
     husband accompanies consecrated men (and accordingly: wife accompanies consecrated women) 
2. accompanying consecrated person has additional constraints:
2.a. only "experienced" may accompany those less experienced, it means that deacons, seminarians can't accompany priest nor monk; 
     if husband or wife accompanies consecrated person it must be person having status "experienced" (means having some years of marial experience to be able to wisely provide companionship guidance)
3. separation of superiority and companionship rule - it means: person supervising other person (see hierarchy of leadership below) can't be accompanying for that person. 
   Rule is to protect openness in the relation without impact of supervisor dependence.
4. companionship eligibility - general rule is that all people are eligible for companionship, however, some people may have status "not eligible" - in such case those are not allowed to build 
   accompanying-accompanied relation
Application should allow for easy entering new people and new relation. Described problem has a graph nature so, application should be able to visually present graphs showing:
- overall graph of accompanying/accompanied for people in system served by given Delegate
- accompanying view - graph of all people/couples accompanied by given person/couple
- missing companionship view - list of people/couples that are eligible for companionship but are not assigned their accompanying person/couple
- overwhelmed view - graph of all people/couples accompanying too many  people/couples. What too many means is application configuration parameter. 
  Goal of this view is to spot overwhelmed person/couple and help them to keep healthy balance between companionship and personal life.
- companionship maintenance view - it should visually show relationship health using color codes: 
  red for companionship relation that exceeded max_meeting_distance threshold (application configuration parameter), 
  yellow for those exceeding min_meeting_distance (also configured parameter)
  and green for those below min_meeting_distance. Idea here is that to keep healthy companionship relation people need to meet regularly and talk to each other - if they don't meet 
  let's say over a year it means there is something wrong with their relation. This requirement means that application should allow to store dates of meetings or other time distance rough entity like 
  monthly, quarterly, bi-yearly, once-a-year or so. If there is no last meetings distance data for given companionship relation - application should display it in gray color 
  which means "relationship health" data not available
Application should be members-only protected. Later on we may find out more detailed access level rules that allow access to application sub-functionalities based on assigned access rules.
Application should be web application with frontend and backend with possibility to extend it to be mobile app reusing backend created at phase 1.

Person or couple may be assigned "companionship delegates" role which means they are responsible for keeping whole companionship relations system healthy. 
It means those people are first target group (personas) for application use (since application should help them in operating their role) - so, 
for first phase only  "companionship delegates" will have access to application and not other members of community.

Now, let's clarify naming to better match reality:
1. hierarchy of geographical grouping:
- smallest unit is "Sector" (I forgot that for big provinces we may spit to Sectors)
- Province built-up from Sectors
- Country built-up from Provinces
- Zone (not region) built-up from Countries
- Community as whole
2. hierarchy of leadership
- Sector Head (person or couple)
- Province Head (person or couple)
- Country Head (person or couple)
- Zone Delegate (person or couple)
- General Moderator (person or couple responsible for whole Community)
3. hierarchy of Companionship Delegates (also person or couple possible)
- Province Companionship Delegates (notice - there is no Sector Companionship Delegates)
- Zone Companionship Delegates (notice - there is no Country Companionship Delegates)
- International Companionship Delegates cooperating with Companionship International Commitee
That different hierarchies must be encountered when calculating separation of power constraint.

We may have hierarchy of Delegates: province delegates (basic level, most interested in our application since it mostly helps in their duties) 
and higher level Delegates (zone, whole community). Higher level delegates duty is to coordinate other lower-level Delegates. 
But they don't need to handle same tasks as lower level Delegates so, they are not interested in same things. 
And most importantly they are not DOING same things. Higher level delegates mainly nominate basic Delegates and train them but they don't build companionship relations 
nor directly act to maintain their health. So higher level delegates will need read-only view to graph visuals (as do have basic Delegates) but 
with filters for province - that is their handling for phase-1 - they may see same or even more then basic Delegates but they can't edit. 
What "even more" means? basic delegates can see "who is accompanied by whom" but only for own province. From all other provinces they can't see it but 
can see just "available Accompanying people/couples" (maybe with additional graphical hint "overwhelmed") to be able to try building companionship relation first with less loaded ones. 
Accordingly zone level Delegates can see "who is accompanied by whom" for whole zone they are responsible for but not from whole community. 
From higher-level geo-groups they may see "available Accompanying people/couples".

Supervision Assignment: Supervision has parallel hierarchy to Delegates as seen above. No person can have both roles (separation of power). 
Usually Supervisors are couples. When province Delegate enters persons/couples into system then Delegate knows Supervisor status and level so, 
can enter it directly into system. Entering person/couple as province Head instantly builds supervising-supervised relation between that person/couple 
and all members belonging to province. And accordingly: adding Country Head automatically builds supervising-supervised relation between that person/couple and all members belonging to country, and so on.

Clarification to "Overall graph": it should not show cross-province candidate visibility. It should show that already existent Accompanying comes from other province 
(for example by specific color or different icon - TBD). 

Cross-province candidate visibility should be separate graph that delegate may use when intentionally searching for Accompanying person. 
System may support Delegate by proposing such view when system asked "find me available Accompanying" can't find such a person due to contraints:
- the no-discussion constraint here is "power separation rule". 
- Soft constraint here is "all available are overwhelmed" - soft since we prefer face-to-face interaction so, other province may mean long distance and only voice/video meetings --> so, 
  Delegate may ask overwhelmed person/couple for "yet another accompanied" for the good of Accompanied person.

Yet another people attribute has been uncovered: spoken languages. To be able to talk during companionship meeting people need to talk same language. 
That is per default language of their geo-location - german for Germany habitants, french for France habitants etc. It is usually not a problem within province. 
But if we need cross-province companionship it may appear that it crosses country/language borders. So, we have to know that people can communicate. 
That is why we should store all languages that people are capable to speak with. Then if Delegate searches for cross-country Accompanying person for German habitant speaking English and Spanish 
then system can filter only those who speak English or Spanish.

Ah, I have just uncovered yet another constraint: not all community members may become Accompanying persons - that is delegates responsibility 
to mark if given person/couple is already nominated to be Accompanying person for companionship eligible person/couple.

# Clarifications:

1. How non-Delegates exist in the system for Phase-1?
In general: as entities only, not users. but they should appear in system the way that will allow smooth transition of them into real users of system. 
In future release normal users (non-Delegates) should benefit from application for their companionship meetings logistics and conducting: 
- planning time, putting it into their calendars (export to google calendar, outlook or any other used), 
- setting reminders, 1:1 chat notification (note here: meetings are always face-to-face, voice calls or video-calls by never via chats - we need deep human to human interaction 
  and chat only dialogue may lead into misunderstanding), 
- voice-call or video-call (phase-2 may add to calendar meetings just links to external voice/video communication tools like phone call, WhatsUp, messanger, ...; 
  phase-3 may implement application native voice-call/video-call). Benefit from phase-2/phase-2 will be that companionship meetings arranged/conducted by application will auto-populate 
  "relationship health" data via storing time of meeting (either planned in calendar or really conducted) 

2. how should Delegates act if they are couple?
Delegates should not act as single account since then we will not have traceability who has made given action in the system. 
Wife may forget to communicate to husband and that may lead to duplicate action on same matter. 
Delegates are nominated by Community as a couple but that is just  informative for the system. 
In theory it is possible that single person (f.ex. deacon) will be nominated as Companionship Delegate.

3. How to handle big graphs that may be seen at "overall graph view"?
Delegates are nominated per specific group within community. It might be province (around 200 people), or country (multiple provinces) or whole community. 
That way we have uncover yet another hidden relation - people belong to: province, country, zone (like East Europe or any other multi-country group), 
whole community (we have geographical hierarchy here). So basic "overall graph" should be limited to those people that are directly supported by Delegate. 
However, that relation is not strict set assignment without overlaps. There are cases when accompanying person can't be found within province
(for example due to constraints like "Power separation") and then Delegates need to cooperate to find Accompanying person from other province. 
That overlapping should be solved that way: Delegates are allowed to add people to system only for own province but should be able to see Accompanying candidates from whole community (all provinces).

4. How to handle cross-province companionship?
Assigning cross-province companionship will be joint effort of both Delegates and Accompanying and Accompanied - detailed flow is TBD for now.
Moreover, not only both province Delegates must agree but also Accompanied must agree to Accompanying - that agreement is most critical one since companionship is not enforced but proposed. 
So, no overlapping authority exists here. After Delegates dialog with both ends of companionship relation any of two province Delegates may approve new relation in system - just for tracking 
let's mark who has done it. 

5. How to handle Accompanying person/couple change?
Accompanied person/couple may request Delegate "I want to change Accompanying person/couple". In such case delegate should mark in system "change requested". 
Moreover, once a year (or once per 2 years - configurable 1-5 years) Delegate should ask (system will help with reminder) "do you want a change?"
There is maximum value - default is 5 years (configurable) - after that time Accompanied person/couple MUST change Accompanying person/couple.

5. What is graphs usage?
graphs should be just visuals helping delegates but not editing entity. Assigning relation, entering people and so on are workflows that should follow "workflow rules" 
(like the one more complicated for cross-province companionship establishment). Moreover, actions on a system may evolve via adding/changing rules for given workflow in the future. 
So, system is not expected to edit graph in-place (that would suit only simplest cases). Rather it is expected to trigger specific workflow from graph view and then update graph view 
after workflow completion (or even during (transition in-progress view) if workflow is time consuming). 
Example could be: we display "Overwhelmed view" and from within view we start "re-balance workflow" which should shift companionship from overloaded Accompanying to less loaded ones.

6. How to initially load system from old formats?
I'd like to have 2 initial possibilities: from CSV and from Microsoft Excel file since Excel is current tool used by Delegates

7. How to handle risk of double work or confusion when Delegate is couple?
Since Delegates are frequently couples there could be potential risk "Delegates as Couples vs Individuals"
Workflows like “assign companionship” may involve both spouses independently acting. Risk of conflicting edits.
Gap: No concurrency strategy (e.g., husband assigns A, wife assigns B).
Contradiction: The app says “couple nominated as Delegate” but operationally they are independent accounts → possible double work or confusion.
Mitigation: “delegate couple dashboard” view where actions are merged but with individual audit trails,
so if Delegates are couple they do operate as one entity but we keep track who has made specific action. 
The risk for "husband assigns A, wife assigns B" is almost zero since assignment is a process which requires Accompanied agreement so couple discuses about it during process. 
Moreover, proposing Accompanying person is one by one till Accompanied agrees.

8. Graph vs Workflow Expectation
Risk: Graphs are non-editable, but Delegates will expect drag-drop or “quick fix” UI for simple cases.
Contradiction: Saying “graphs are only visuals” may conflict with user intuition.
Gap: Missing definition of “graph-initiated workflows” → e.g., click on node to start assignment wizard.
👉 Mitigation: Market clearly: “Graphs are dashboards, not editors”. But allow workflow entry points from graph (click a node/edge triggers wizard). That bridges both worlds.

9. Data Import Reality
Risk: Excel sheets across provinces/countries likely have inconsistent formats. Bulk import may break.
Gap: No definition of validation flow (clean data → load errors → manual fix loop).
Contradiction: Expectation that Delegates “just upload Excel” vs reality of months of messy cleanup.
👉 Mitigation: Build import as 2-step wizard: preview → errors flagged → fix or skip. Phase-1 must tolerate messy inputs.

10. Eligibility + Nominated Accompanying Persons
Risk: Province Delegates must mark who can be an Accompanying person. What if Country Delegate disagrees?
Contradiction: Higher-level Delegates see but cannot edit → oversight without correction power.
Gap: Missing escalation workflow (“Country Delegate flags ineligible mark for review”).
👉 Mitigation: Add “flag for review” mechanism for higher-level Delegates (doesn’t edit, but raises issue for Province Delegate resolution).

11. Scalability
Risk: Province graphs may be manageable (~200 nodes). Country graphs may become thousands. Region/community graphs → overwhelming.
Gap: No mention of progressive rendering or filters by role/status/eligibility.
Contradiction: “Higher-level Delegates get more visibility” but in practice may get too much to be usable.
👉 Mitigation: Always render graphs scoped by filters (e.g., show only overwhelmed nodes, or only missing companionships). Avoid raw “hairball” graphs.


# Workflow Mapping (Phase-1 Core)
Below is a first mapping of core workflows with triggers, actors, and steps.

1. Add Person / Couple
Actor: Province Delegate
Trigger: New member entity
Steps:

Delegate opens “Add Person” wizard (or bulk-import CSV/XLSX).

Enter attributes: name, gender, marital/ordination status, province, eligibility, languages, experience flag.

Assign role(s): member, Supervisor (with level), or Delegate (with level).

If Supervisor role chosen → system automatically creates supervising relations for scope.

Save → entity added to graph.
Constraints enforced: eligibility, correct role typing.

2. Assign Companionship (within province)
Actor: Province Delegate
Trigger: Missing companionship identified.
Steps:

Delegate opens assignment workflow (from missing list or graph).

System proposes candidates (constraints enforced: respecting gender, consecrated rules, experience, power separation, language).

Delegate proposes candidate to Accompanied person/couple.

Accompanied either accepts (→ relation created) or rejects (→ cycle repeats).

Delegate finalizes in system.

Graph updates.

3. Assign Cross-Province Companionship
Actor: Province Delegates from both provinces + Accompanied
Trigger: No local candidates available (hard/soft constraints).
Steps:

Delegate opens “Cross-Province Candidate Graph.”

System shows eligible external candidates (filtered by language, eligibility, availability).

Delegates from both provinces discuss with Accompanied.

Accompanied agrees → either Delegate may finalize assignment.

System logs approver, both Delegates, and Accompanied consent.

Graph updates (with cross-province marker).

4. Change Request (Accompanied-initiated)
Actor: Accompanied person/couple via Delegate
Trigger: Accompanied requests new companion.
Steps:

Delegate marks “Change Requested” in system.

Relation flagged in graph (e.g., orange).

Delegate initiates new assignment workflow (local → cross-province if needed).

Upon acceptance → old relation archived, new relation created.

5. Periodic Review (“Do you want a change?”) & Maximum Term
Actor: Province Delegate
Trigger: Configurable cycle (1–5 years).
Steps:

System reminds Delegate to check every X years (configurable, 1–5).

If under max-term: Delegate asks Accompanied if they want change.

No → reset review timer.

Yes → change request workflow.

If max-term reached (default 5 years): system forces change request.

Delegate initiates reassignment workflow (Accompanied must accept new companion).

6. Rebalance (Overwhelmed View)
Actor: Province Delegate
Trigger: Over-capacity companion detected.
Steps:

Delegate opens “Rebalance” workflow from Overwhelmed View.

System lists overloaded relations.

Delegate attempts to redistribute Accompanied among underloaded local candidates.

If impossible (soft/hard constraints) → system proposes Cross-Province Candidate Graph.

New assignments made via consent process.

7. Supervision Assignment
Actor: Province Delegate
Trigger: New member or role change.
Steps:

Delegate adds person/couple as Supervisor at Sector/Province/Country/Zone/Community level.

System auto-creates supervising-supervised relations for all people in that scope.

Rule enforced: no one may simultaneously hold Supervisor and Companionship Delegate role.

8. Health Data Update
Actor: Delegate
Trigger: Meeting occurs (face-to-face, call, video).
Steps:

Delegate records last meeting date or cadence.

Health view updates color (Green/Yellow/Red/Gray).
Future: Auto-update when meetings scheduled via app.

