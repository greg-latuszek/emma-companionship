# Problem description

I want to build relations tracking application called "emmaCompanionship" that helps people responsible for maintaining relationships and dialogue between people (community members) in these relationships. 
We have three types of people involved in those relations: couples (married people), consecrated members (priests, deacons, seminarians, consecrated sisters, consecrated brothers), single people.  
We have four types of relation here: "accompanying" (person or couple who accompanies other person/couple) and "accompanied" (reverse relation: person or couple being accompanied by his/her/their companion(s)), 
and "supervising" (person supervising other person), and "supervised" (reverse relation: person being supervised by other person). 

# Terminology
- **Community**: Group of people of different states (single, consecrated or couple).
- **Community Member**: Person belonging to Community.
- **Consecrated Community Member**: Person belonging to Community and being consecrated (priest, deacon, consecrated sister, consecrated brother) - not seminarian, nor monk, nor nun.
- **Consecrated Person**: priest, deacon, consecrated sister, consecrated brother, seminarian, monk, nun - that may or may not be Community Member.
- **Youth**: Teenager or young adult before choosing life's vocation.
- **Elderly Sister/Brother**: Community member over 70 years old.
- **Couple**: Two persons (husband and wife) being married to each other.
- **Single Person**: Person not being part of couple nor Youth, and usually over 30 years old.
- **Widow/Widower**: Person being widowed.
 
- **Companion**: Person or couple who accompanies other person/couple.
- **Accompanied**: Person or couple being accompanied by his/her/their companion(s).
- **Accompanying**: Relation from Companion to Accompanied.
- **Accompanied-by**: Relation from Accompanied to Companion. 

- **Associate Community Member**: Person belonging to Community on special rights (may become Accompanied but not Companion).

- **Supervisor**: Person or couple supervising other person/couple.
- **Supervised**: Person or couple being supervised by other person/couple.
- **Supervising**: Relation from Supervisor to Supervised.
- **Supervised-by**: Relation from Supervised to Supervisor.

- **Companionship**: The system of relationships between Companions and Accompanied persons/couples.
- **Companionship Delegate**: Person or couple responsible for maintaining the companionship relations system. Those people are main target group (personas) for
                              application use (since application should help them in operating their role).
- **Companionship Relation**: Accompanying or Accompanied relation between two persons or couples.
- **Companionship Service**: being Companion in service of Accompanied. Also being Companionship Delegate of any level.
- **Companionship Health**: The status of the companionship relation, determined by the frequency of meetings and communication.
- **Companion Support Health**: The status of support provided by Companionship Delegate to Companion, 
                                determined by the frequency of their meetings (should be at least once a year) and list of provided trainings.
- **Accompanying Readiness**: The status that determines if person/couple can-be/is Companion. Possible values:
  - **Not Candidate**: Person/couple is not eligible to become Companion.
  - **Candidate**: Person/couple is candidate to become Companions - has enough experience, usually needs training.
  - **Ready**: Person/couple may start to be Companion any time but has none Accompanied yet (ready but not assigned Companionship Relation).
  - **Active**: Person/couple has at least one Companionship Relation.
  - **Overwhelmed**: Person/couple is accompanying too many people/couples.
  - **Deactivated**: Person/couple is no more Companion due to some reason (resigned from Companionship service, left Community).
- **Community Experience**: The status that determines whether a person/couple is experienced enough to provide companionship guidance (to become Companion).
- **Community Engagement Status**: The status of belonging to Community, which may be one of the following:
  - **Looker-On**: Person/couple looking at the life of Community and considering whether to get involved.
  - **In-Probation**: Person/couple being in Community probation period.
  - **Commited**: Person/couple commited to Community life.
  - **In-Fraternity-Probation**: Person/couple commited to Community life and being in probation period of Fraternity of Jesus.
  - **Fraternity**: Person/couple commited to Community life and being member of Fraternity of Jesus.
- **Companionship Eligibility**: The status that determines whether a person/couple is eligible for Companionship Relation (to become Accompanied person/couple).
  - it is calculated parameter: anyone besides "Looker-On" is eligible for Companionship Relation. It is so since Companionship is provided to all Community Members,
    (those who are just looking at the life of Community and considering whether to get involved are not formally Members).

# Hierarchical terms
## Hierarchy of geographical grouping
- smallest unit is "Sector" (may not exist if Province is small enough)
- Province built-up from Sectors
- Country built-up from Provinces
- Zone built-up from Countries
- Community as whole
## Hierarchy of leadership
- Sector Head (person or couple)
- Province Head (person or couple)
- Country Head (person or couple)
- Zone Delegate (person responsible for whole Community, from Fraternity of Jesus)
- General Moderator (person responsible for whole Community, laity from Fraternity of Jesus)
## Hierarchy of Companionship Delegates (also person or couple possible)
- Companionship Delegates (responsible for companionship inside Province; notice - there is no Sector Companionship Delegates)
- Zone Companionship Delegates (responsible for companionship inside Zone; notice - there is no Country Companionship Delegates)
- International Companionship Delegates cooperating with Companionship International Committee

# Accronyms
- **(PH)**: Province Head
- **(CD)**: Companionship Delegates


# Constraints

There are following constraints here:

1. Confidentiality: Companionship Dialog is confidential and should be protected as much as possible.
Initial version of service doesn't provide any means to conduct Companionship Dialogs, so it is not a problem for now.
However, in future versions it may be possible to conduct Companionship Dialogs via application. Then, confidentiality will be a key requirement.
Application can't store any data about Dialog content (text, voice, video), it should just provide means to conduct Dialogs and store information 
about Dialogs conducted (date, time, participants, etc.). For conducting dialogs, application may use external tools like phone calls, WhatsApp, Messenger, etc.
but should prioritize encrypted communication channels, or even better, provide its own encrypted communication channel for Dialogs - where best possible option
is to have direct device-to-device encrypted communication channel without any server in the middle.
Supporting to confidentiality is open-source nature of application - it should be open-source so that anyone can verify that application doesn't store any Dialog content.
Application should be members-only protected. Later on we may find out more detailed access level rules that allow access to application sub-functionalities based on assigned access rules.
Initial version (Phase1) is for (CD) of all levels (Province, Zone, International) and for (PH) of Province level.
Initial version (Phase1) of application should also support confidentiality by providing only minimal required information about Companionship Relations,
and only to those that require it for their duties (Companionship Delegates). Details - TBD
In very rare cases, confidentiality may be broken - detailed rules TBD

2. Companionship follows gender: men accompanies men, woman accompanies woman
2.a. for couples it means: either they meet 2:2 (couple with couple) or 1:1 (husband with husband, wife with wife) 
     but never accompanying husband with accompanied wife nor accompanying wife with accompanied husband
2.b. for consecrated persons it means: either consecrated men accompanies consecrated men (and accordingly: consecrated women accompanies consecrated women) or 
     husband accompanies consecrated men (and accordingly: wife accompanies consecrated women)

3. Accompanying consecrated person has additional constraints:
2.a. only "experienced" may accompany those less experienced, it means that deacons, seminarians can't accompany priest nor monk; 
     if husband or wife accompanies consecrated person it must be person having status "experienced" (means having some years of marial experience to be able to wisely provide companionship guidance)

4. Separation of superiority and companionship rule - it means: person supervising other person (see Hierarchical terms) can't accompany that person. 
   Rule is to protect openness in the relation without impact of supervisor dependence.
4.a. That constraint may cause that system can't find Companion for given Accompanied person/couple locally inside province. 
   In such case, Companionship Delegate (CD) should try to find Companion from other province (cross-province companionship search workflow). 

5. Companionship eligibility - rule is that all community members are eligible for companionship, so, 
   people engaged at "Looker-On" level are "not eligible" - in such case those are not allowed to build accompanying-accompanied relation

6. Duration of Companionship Service: basic is for 5 years (configurable), may be extended and shortened mainly on request from Companion. 
   At the end of basic Duration Companion must be asked "do you still want to be in service?"

7. language barrier - Companionship Relation may be established only if both Accompanied and Companion speak same language (or have common language) 
   - this is to ensure that Companionship Dialogs can be conducted in understandable way. 
   That is per default language of their geo-location - German for Germany inhabitants, French for France inhabitants etc. It is usually not a problem within province. 
   But if we need cross-province companionship it may appear that it crosses country/language borders. So, we have to know that people can communicate. 
   That is why we should store all languages that people are capable to speak with. Then if Delegate searches for cross-country Companion 
   for German inhabitant speaking English and Spanish then system can filter only those who speak English or Spanish.

# Visuals serving application goals

Application should allow for easy entering new people and new relation. 
Described problem has a graph nature so, application should be able to visually present graphs showing:

- overall graph of accompanying/accompanied for people in system served by given Delegate
  - it should not show cross-province Companion candidates (separate view below). However, it should show that already existent Companion 
    comes from other province (for example by specific color or different icon - TBD). 

- accompanying view - graph of all people/couples accompanied by given person/couple

- missing companionship view - list of people/couples that are eligible for companionship but are not assigned their accompanying person/couple

- new Companions view
  not all community members may become Companions - that is delegates responsibility to mark if given person/couple is already nominated 
  to be Companion for companionship eligible person/couple. So, (CD) sets "Accompanying Readiness" status.
  While searching for new Companions, (CD) may use "new Companions view" that shows all people/couples that have status:
   - "Candidate" - means that person/couple is candidate to become Companions - has enough experience, usually needs training.
   - "Ready" - means that person/couple may start to be Companion any time but has none Accompanied yet (ready but not assigned Companionship Relation).
   - "Not Candidate" - to rethink if that person/couple may become "Candidate" in nearest future and arrange dialog with them.

- overwhelmed view - graph of all people/couples accompanying too many  people/couples. What too many means is application configuration parameter. 
  Goal of this view is to spot overwhelmed person/couple and help them to keep healthy balance between companionship and personal life.

- Cross-province Companion candidate view - graph that (CD) may use when intentionally searching for Companion. 
  System may support (CD) by proposing such view when system asked "find me available Companion" can't find such a person due to constraints:
  - the no-discussion hard constraint here is "power separation rule". 
  - Soft constraint here is "all available are overwhelmed" - soft since we prefer face-to-face interaction so, other province may mean long distance
    and only voice/video meetings --> so, (CD) may ask overwhelmed person/couple for "yet another accompanied" for the good of Accompanied person/couple.
  - next Soft constraint here is "prefer Fraternity" - if Accompanied engagement status is "In-Fraternity-Probation" or "Fraternity" then we prefer to find Companion 
    from Fraternity of Jesus (or in probation to it) since they are more engaged in Community life and have better understanding of its values
    and local province may have no such Companion candidates.
  - that view when presenting cross-province candidates should show all available Companions from all provinces 
    (we need filtering by zone/country/province with default selection to nearest province from same country/language), 
    but with additional graphical hint "overwhelmed" for those who are already accompanying too many people/couples.
  - similarly we need filtering by "Fraternity" or graphical hint "Fraternity" (if "Fraternity" filter is off) for those who are from Fraternity of Jesus (or in probation to it).

- companionship health view - it should visually show relationship health using color codes: 
  red for companionship relation that exceeded max_meeting_distance threshold (application configuration parameter), 
  yellow for those exceeding min_meeting_distance (also configured parameter)
  and green for those below min_meeting_distance. Idea here is that to keep healthy companionship relation people need to meet regularly and talk to each other - if they don't meet 
  let's say over a year it means there is something wrong with their relation. This requirement means that application should allow to store dates of meetings or other time distance rough entity like 
  monthly, quarterly, bi-yearly, once-a-year or so. If there is no last meetings distance data for given companionship relation - application should display it in gray color 
  which means "relationship health" data not available

- companion health view - it should visually show health of support provided to Companion in service by Companionship Delegates using color codes: 
  green for healthy companionship service, yellow for warning ( (CD) didn't contact Companion over a year), red for unhealthy ( (CD) didn't contact Companion over 2 years).
  This view should also show list of trainings provided by (CD) to Companion person/couple.

# Application form
Application should be web application with frontend and backend with possibility to extend it to be mobile app reusing backend created at phase 1.

# Usage groups
Main target group (personas) for application use are Companionship Delegates (CD) of all levels (Province, Zone, International)
where (CD) (province level delegates) are main users of application since it mostly helps in their duties.

We have hierarchy of Companionship Delegates: (CD) province delegates (basic level, most interested in our application since it mostly helps in their duties, we call them basic Delegates in this chapter) 
and higher level Delegates (zone, whole community). Higher level delegates duty is to coordinate other lower-level Delegates. 
But they don't need to handle same tasks as lower level Delegates so, they are not interested in same things. 
And most importantly they are not DOING same things. Higher level delegates mainly nominate basic Delegates and train them but they don't build companionship relations 
nor directly act to maintain their health. So higher level delegates will need read-only view to graph visuals (as do have basic Delegates) but 
with filters for province - that is their handling for phase-1 - they may see same or even more then basic Delegates but they can't edit. 
What "even more" means? basic delegates can see "who is accompanied by whom" but only for own province. From all other provinces they can't see it but 
can see just "available Companions people/couples" (maybe with additional graphical hint "overwhelmed") to be able to try building companionship relation first with less loaded ones. 
Zone level Delegates are not interested in detailed "who is accompanied by whom" view but rather in health of companionship system. Same for International Companionship Delegates.
So, they are interested in following visuals:
- missing companionship view
- overwhelmed view
- companionship health view
- companion health view
Even availability of those views is questionable since they are not interested in details but rather statistics. So, later phases may add some charts
that may inform them about size of difficulties in companionship system, with filters for province, country, zone, community.

# Clarifications:

1. How non-Delegates exist in the system for Phase-1?
In general: as entities only, not users but they should appear in system the way that will allow smooth transition of them into real users of system. 
In future release normal users (non-Delegates) should benefit from application for their companionship meetings logistics and conducting: 
- planning time, putting it into their calendars (export to google calendar, outlook or any other used), 
- setting reminders, 1:1 chat notification (note here: meetings are always face-to-face, voice calls or video-calls by never via chats - we need 
  deep human to human interaction and chat only dialogue may lead into misunderstanding), 
- voice-call or video-call (phase-2 may add to calendar meetings just links to external voice/video communication tools like phone call, WhatsUp, messanger, ...; 
  phase-3 may implement application native voice-call/video-call). Benefit from phase-2/phase-2 will be that companionship meetings arranged/conducted by application will auto-populate 
  "relationship health" data via storing time of meeting (either planned in calendar or really conducted) 

2. How should Delegates act if they are couple?
Delegates should not act as single account since then we will not have traceability who has made given action in the system. 
Wife may forget to communicate to husband and that may lead to duplicate action on same matter. 
Delegates are nominated by Community as a couple but that is just  informative for the system. 
In theory it is possible that single person (f.ex. deacon) will be nominated as Companionship Delegate.

3. How to handle risk of double work or confusion when Delegate is couple?
Since Delegates are frequently couples there could be potential risk "Delegates as Couples vs Individuals"
Workflows like “assign companionship” may involve both spouses independently acting. Risk of conflicting edits.
Gap: No concurrency strategy (e.g., husband assigns A, wife assigns B).
Contradiction: The app says “couple nominated as Delegate” but operationally they are independent accounts → possible double work or confusion.
Mitigation: “delegate couple dashboard” view where actions are merged but with individual audit trails,
so if Delegates are couple they do operate as one entity but we keep track who has made specific action. 
The risk for "husband assigns A, wife assigns B" is almost zero since assignment is a process which requires Accompanied agreement so couple discuses about it during process. 
Moreover, proposing Companion is one by one till Accompanied agrees.

4. How to handle big graphs that may be seen at "overall graph view"?
(CD) are nominated per specific group within community. It might be province (around 200 people), or zone (multiple provinces) or whole community. 
That way we have uncover yet another hidden relation - people belong to: sector, province, country, zone, 
whole community (we have geographical hierarchy here). So basic "overall graph" should be limited to those people that are directly supported by (CD). 
However, that relation is not strict set assignment without overlaps. There are cases when Companion can't be found within province
(for example due to constraints like "Power separation") and then Delegates need to cooperate to find Companion from other province. 
That overlapping should be solved that way: (CD) are allowed to add people to system only for own province but should be able 
to see Companion candidates from whole community (all provinces with province filter).

5. How to handle cross-province companionship?
Assigning cross-province companionship will be joint effort of both Delegates and Accompanying and Accompanied - detailed flow is TBD for now.
Moreover, not only both province Delegates must agree but also Accompanied must agree to Accompanying - that agreement is most critical one since companionship is not enforced but proposed. 
So, no overlapping authority exists here. After Delegates dialog with both ends of companionship relation any of two province Delegates may approve new relation in system - just for tracking 
let's mark who has done it. 

6. How to handle Accompanying person/couple change?
Accompanied person/couple may request (CD) "I want to change Accompanying person/couple". In such case delegate should mark in system "change requested". 
Moreover, once a year (or once per 2 years - configurable 1-5 years) Delegate should ask (system will help with reminder) "do you want a change?"
There is maximum value - default is 5 years (configurable) - after that time Accompanied person/couple MUST change Companion.

7. What is graphs usage?
graphs should be just visuals helping delegates but not editing entity. Assigning relation, entering people and so on are workflows that should follow "workflow rules" 
(like the one more complicated for cross-province companionship establishment). Moreover, actions on a system may evolve via adding/changing rules for given workflow in the future. 
So, system is not expected to edit graph in-place (that would suit only simplest cases). Rather it is expected to trigger specific workflow from graph view and then update graph view 
after workflow completion (or even during (transition in-progress view) if workflow is time consuming). 
Example could be: we display "Overwhelmed view" and from within view we start "re-balance workflow" which should shift companionship from overloaded Companion to less loaded ones.

8. Graph vs Workflow Expectation
Risk: Graphs are non-editable, but Delegates will expect drag-drop or “quick fix” UI for simple cases.
Contradiction: Saying “graphs are only visuals” may conflict with user intuition.
Gap: Missing definition of “graph-initiated workflows” → e.g., click on node to start assignment wizard.
Mitigation: Market clearly: “Graphs are dashboards, not editors”. But allow workflow entry points from graph (click a node/edge triggers wizard). That bridges both worlds.

9. How to initially load system from old formats?
I'd like to have 2 initial possibilities: from CSV and from Microsoft Excel file since Excel is current tool used by Delegates

10. Data Import Reality
Risk: Excel sheets across provinces/countries likely have inconsistent formats. Bulk import may break.
Gap: No definition of validation flow (clean data → load errors → manual fix loop).
Contradiction: Expectation that Delegates “just upload Excel” vs reality of months of messy cleanup.
Mitigation: Build import as 2-step wizard: preview → errors flagged → fix or skip. Phase-1 must tolerate messy inputs.

11. Eligibility + Nominated Companions
Risk: (CD) must mark who can be a Companion (changing "Accompanying Readiness" status). What if Zone Delegate disagrees?
Contradiction: Higher-level Delegates see but cannot edit → oversight without correction power.
Gap: Missing escalation workflow (“Zone Delegate flags ineligible mark for review”).
Mitigation: Add “flag for review” mechanism for higher-level Delegates (doesn’t edit, but raises issue for Province Delegate resolution).

12. Scalability
Risk: Province graphs may be manageable (~200 nodes). Zone graphs may become thousands. Community graphs → overwhelming.
Gap: No mention of progressive rendering or filters by role/status/eligibility.
Contradiction: “Higher-level Delegates get more visibility” but in practice may get too much to be usable.
Mitigation: 
- overall graph should be available only to (CD) and (PH) of Province level (since they cooperate)
- Zone Delegates and International Delegates should see only charts of (for Phase-1) simple lists
  filtered (e.g., by province, country, zone) with pagination like 100 per page.
- those charts/lists should mimic "health" graphs (not "operational" graphs) so, their topisc are: 
  - missing companionships
  - overwhelmed companions
  - companionship health (how many relations are healthy, how many are not)
  - companion health (how many companions are healthy, how many are not)


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

Context: Supervision has parallel hierarchy to Companionship Delegates as seen above. No person can have both roles (separation of power). 
Usually Supervisors are couples. When (CD) enters persons/couples into system then Delegate knows Supervisor status and level so, 
can enter it directly into system. Entering person/couple as province Head instantly builds supervising-supervised relation between that person/couple 
and all members belonging to province. And accordingly: adding Country Head automatically builds supervising-supervised relation 
between that person/couple and all members belonging to country, and so on.

Rule enforced: no one may simultaneously hold Supervisor and Companionship Delegate role.

8. Health Data Update
Actor: Delegate
Trigger: Meeting occurs (face-to-face, call, video).
Steps:

Delegate records last meeting date or cadence.

Health view updates color (Green/Yellow/Red/Gray).
Future: Auto-update when meetings scheduled via app.

