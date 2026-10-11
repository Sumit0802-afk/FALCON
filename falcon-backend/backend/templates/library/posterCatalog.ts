/**
 * What poster templates are about: the categories, and for each one the
 * wording a poster of that kind would carry. All copy is original and written
 * as realistic placeholder text the user replaces.
 */

export type DetailKind = "event" | "online" | "offer" | "hiring" | "course" | "launch" | "social" | "announce" | "award" | "sports";

export interface PosterSubcategory {
  group: string;
  slug: string;
  name: string;
  industry: string;
  details: DetailKind;
  kickers: string[];
  titles: string[];
  taglines: string[];
  ctas: string[];
  /** Photo list to draw from for photo-led layouts */
  photos: string;
}

export const POSTER_GROUPS: { slug: string; name: string }[] = [
  { slug: "events", name: "Events" },
  { slug: "business", name: "Business" },
  { slug: "education", name: "Education" },
  { slug: "social-media", name: "Social Media" },
];

type Row = [string, string, string, string, DetailKind, string, string, string, string, string];

// group, slug, name, industry, details, kickers, titles, taglines, calls to action, photo list
const ROWS: Row[] = [
  ["events", "hackathon", "Hackathon", "technology", "event", "48-Hour Build Sprint|Code. Ship. Win.|Open Innovation Challenge|Student Developer Series", "Hack The Future|Build Night|Code Storm|Ship It Weekend|Byte Battle", "Two days, one idea, and a team that refuses to sleep.|Bring a laptop and a problem worth solving.|Mentors, midnight snacks and prizes for the boldest builds.", "Register your team|Apply now|Reserve a seat", "technology"],
  ["events", "coding-competition", "Coding Competition", "technology", "online", "Algorithm Showdown|Competitive Programming Cup|Three Rounds. One Champion.", "Code Clash|Algo Arena|Bug Hunt Cup|Syntax Wars", "Solve fast, solve clean, climb the leaderboard.|Sharpen your logic against the best on campus.|Every test case counts.", "Enter the contest|Sign up free|Join the arena", "technology"],
  ["events", "tech-fest", "Tech Fest", "technology", "event", "Annual Technology Festival|Three Days Of Ideas|Innovation On Campus", "Tech Horizon|Innovate Fest|Circuit Carnival|Future Forward", "Talks, demos and showcases from the people building what comes next.|Robots, startups and late-night demos under one roof.|Where curious minds meet working prototypes.", "Get your pass|See the lineup|Book tickets", "technology"],
  ["events", "college-event", "College Event", "education", "event", "Campus Calendar|Student Council Presents|This Semester", "Campus Live|The Big Day|Freshers Night|Founders Day", "One evening the whole campus will be talking about.|Music, food and everyone you know.|Come for the show, stay for the people.", "Save the date|RSVP today|Join us", "events"],
  ["events", "workshop", "Workshop", "education", "course", "Hands-On Session|Learn By Doing|Limited Seats", "Design Sprint Lab|Build With Data|Prototype In A Day|Skill Up Studio", "Leave with something you made, not just notes.|Small group, real tools, patient instructors.|A practical afternoon for people who learn by doing.", "Book your seat|Enroll now|Claim a spot", "education"],
  ["events", "seminar", "Seminar", "education", "event", "Guest Lecture Series|Expert Talk|Department Seminar", "Ideas Worth Asking|The Next Decade|Beyond The Syllabus|Research In Focus", "An hour with someone who has done the work.|Bring your questions. The floor is open.|Fresh thinking from the field, explained plainly.", "Reserve a seat|Register free|Attend the talk", "education"],
  ["events", "webinar", "Webinar", "business", "online", "Live Online Session|Free Webinar|Ask The Experts", "Scaling Without Chaos|From Zero To Launch|The Remote Playbook|Data You Can Trust", "Forty-five minutes of practice, fifteen of questions.|Join from anywhere. Recording sent to everyone who registers.|Straight answers from people who run this every day.", "Save my spot|Register free|Join live", "business"],
  ["events", "conference", "Conference", "business", "event", "Annual Summit|Industry Conference|Two Days. Forty Speakers.", "Signal Summit|Next Stage|Forward Conference|The Builders Forum", "The people shaping the industry, in one room.|Keynotes, panels and conversations that keep going at dinner.|Come to learn, leave with collaborators.", "Get tickets|View agenda|Register now", "business"],
  ["events", "meetup", "Meetup", "technology", "event", "Community Meetup|Monthly Gathering|Local Chapter", "Devs & Coffee|Product Night|Founders Circle|Design Hangout", "Short talks, long conversations, good company.|No slides required. Just show up.|Meet the people building things near you.", "RSVP now|Join the group|Count me in", "business"],
  ["events", "cultural-event", "Cultural Event", "arts", "event", "Annual Cultural Night|A Celebration Of Colour|Music, Dance, Drama", "Rang Utsav|Mosaic Night|Rhythm & Roots|Kala Sangam", "Traditions old and new, on one stage.|An evening of performances from every corner of campus.|Dress up, show up, celebrate together.", "Get passes|Book your seat|Join the celebration", "events"],
  ["events", "sports-event", "Sports Event", "sports", "sports", "Inter-College Championship|Season Opener|Finals Weekend", "Game On|The Final Whistle|Play Hard League|Champions Cup", "Bring the noise. Your team needs it.|Rivalries settled where they should be: on the field.|Ninety minutes that decide the season.", "Register your team|Get tickets|Cheer with us", "sports"],
  ["events", "competition", "Competition", "education", "event", "Open Challenge|Prizes Worth Winning|Show What You Can Do", "The Grand Challenge|Battle Of Minds|Pitch Perfect|Quiz Quest", "Enter alone or bring a team.|One stage, three rounds, a room full of rivals.|Talent gets you in. Preparation wins it.", "Enter now|Register today|Take the challenge", "events"],
  ["events", "award-ceremony", "Award Ceremony", "business", "award", "Annual Awards Night|Celebrating Excellence|Honouring The Best", "Night Of Honours|The Excellence Awards|Stars Of The Year|Gala Evening", "An evening for the people who raised the bar.|Recognition, applause and a well-earned celebration.|Join us as we honour a remarkable year.", "Reserve your table|RSVP|Confirm attendance", "events"],
  ["events", "festival", "Festival", "arts", "event", "Festival Season|Lights, Music, Food|A Weekend To Remember", "Festival Of Lights|Spring Carnival|Harvest Fair|Winter Mela", "Stalls, stages and something for everyone.|Bring the family. Stay till the last song.|Colour, flavour and music all weekend.", "Get your pass|Join the fun|See the schedule", "events"],
  ["events", "college-fest", "College Fest", "education", "event", "The Fest Is Back|Three Nights. Zero Sleep.|Annual Campus Festival", "Euphoria|Resonance|Zephyr Fest|Momentum", "Headliners, competitions and the best crowd of the year.|Pro nights, food streets and friends from every college.|The weekend your whole year builds up to.", "Grab your pass|Register now|Be there", "events"],
  ["events", "club-event", "Club Event", "education", "event", "Club Recruitment|Open House|Members Night", "Join The Crew|Open Studio|Club Kickoff|New Member Mixer", "Find your people this semester.|Come see what we make, then make it with us.|No experience needed. Curiosity required.", "Sign up|Join the club|Come say hi", "events"],
  ["events", "open-mic", "Open Mic", "arts", "event", "Open Mic Night|Poetry, Comedy, Music|The Stage Is Yours", "Unplugged|Voices After Dark|Mic Drop Night|Stories & Strings", "Five minutes, one microphone, a kind crowd.|Read it, sing it, say it out loud.|First-timers welcome. Applause guaranteed.", "Sign up to perform|Reserve a seat|Come listen", "events"],
  ["events", "gaming-event", "Gaming Event", "gaming", "online", "Esports Tournament|LAN Party|Squad Up", "Clutch Cup|Respawn Rumble|Frag Fest|Arena Royale", "Brackets, casters and a prize pool worth the grind.|Bring your squad and your best aim.|Play for fun. Stay for the finals.", "Register squad|Join the bracket|Play now", "technology"],
  ["events", "networking-event", "Networking Event", "business", "event", "Professional Mixer|Founders & Funders|After-Work Social", "Connect Night|The Intro Hour|Meet The Makers|Open Doors", "Good conversations lead to good work.|Bring business cards or just yourself.|An easy room to meet useful people.", "RSVP today|Join the mixer|Get on the list", "business"],

  ["business", "product-launch", "Product Launch", "technology", "launch", "Introducing|Now Available|The Wait Is Over", "Meet Nova|Launch Day|The New Standard|Say Hello To Next", "Rebuilt from the first line to do more with less.|Everything you asked for. A few things you didn't.|Designed for the way work happens now.", "See it first|Get early access|Pre-order now", "technology"],
  ["business", "company-announcement", "Company Announcement", "business", "announce", "Company Update|A Message To Our Team|Important Notice", "We're Growing|A New Chapter|Big News|Next Phase", "Here is what is changing and why it matters.|Thank you for building this with us.|The same mission, with more room to do it.", "Read the update|Learn more|See details", "business"],
  ["business", "corporate-event", "Corporate Event", "business", "event", "Annual Offsite|Leadership Forum|Town Hall", "Vision Day|All Hands Live|Strategy Summit|Momentum 2026", "A day to step back and plan what comes next.|One team, one room, one direction.|Results reviewed. Priorities set. Wins celebrated.", "Confirm attendance|Add to calendar|RSVP", "business"],
  ["business", "marketing-campaign", "Marketing Campaign", "marketing", "launch", "New Campaign|Made For You|Limited Edition", "Feel The Difference|Made To Move|Start Something|Fresh Take", "The everyday essential, done properly.|Small upgrade. Noticeable difference.|Because good enough was never the goal.", "Shop the range|Discover more|Try it today", "marketing"],
  ["business", "sale", "Sale", "retail", "offer", "End Of Season|This Weekend Only|Clearance Event", "Mega Sale|Final Reductions|Big Savings Days|Stock Out Sale", "Favourite pieces at prices that will not last.|When it's gone, it's gone.|Everything must go. Almost everything will.", "Shop now|Grab the deal|See the offers", "marketing"],
  ["business", "promotion", "Promotion", "retail", "offer", "Special Promotion|Members Exclusive|New Customer Offer", "Double The Value|Upgrade Week|Bonus Season|Treat Yourself", "A little extra, on us.|More of what you came for.|Our thank-you to regulars and newcomers alike.", "Claim offer|Redeem now|Get the bonus", "marketing"],
  ["business", "offer", "Offer", "retail", "offer", "Limited Time Offer|Today Only|Flash Deal", "Flat 50 Off|Buy One Get One|Free Delivery Week|First Order Deal", "Use the code at checkout before midnight.|No catches. Just a good price.|A reason to try what you've been eyeing.", "Use the code|Order now|Unlock the deal", "marketing"],
  ["business", "recruitment", "Recruitment", "business", "hiring", "Careers|Campus Recruitment Drive|Build Your Career Here", "Join Our Team|Grow With Us|Your Next Role|Talent Wanted", "Meaningful work, good people, room to grow.|We hire for curiosity and train for the rest.|Bring your skills. We'll bring the opportunity.", "Apply today|View openings|Send your CV", "business"],
  ["business", "hiring", "Hiring", "technology", "hiring", "We Are Hiring|Open Position|Now Recruiting", "We're Hiring|Engineers Wanted|Design With Us|Join The Build", "Small team, real ownership, problems worth your time.|Ship on day one. Learn every day after.|Remote-friendly, deadline-serious, meeting-light.", "Apply now|See the role|Meet the team", "technology"],
  ["business", "job-fair", "Job Fair", "business", "event", "Career Fair|Fifty Employers. One Day.|Graduate Hiring", "Career Expo|Future At Work|Opportunity Day|The Hiring Hall", "Meet recruiters, hand over your CV, leave with interviews.|Walk in a student. Walk out with options.|Every stall is a door. Knock on a few.", "Register free|Book your slot|Bring your CV", "business"],
  ["business", "brand-announcement", "Brand Announcement", "marketing", "announce", "A New Look|Rebrand|Same Us, Sharper", "New Name. Same Heart.|Hello, Again|We've Evolved|Fresh Identity", "Everything you trusted, expressed more clearly.|A new look for where we're headed.|Our name changed. Our promise didn't.", "See what's new|Explore the brand|Read the story", "marketing"],
  ["business", "business-conference", "Business Conference", "finance", "event", "Leadership Summit|Annual Business Forum|Markets & Strategy", "Growth Summit|The Capital Forum|Leaders Connect|Boardroom 2026", "Practical strategy from operators, not theorists.|Markets, talent and technology in one agenda.|The conversations that set next year's plans.", "Reserve a seat|View speakers|Register now", "business"],

  ["education", "college-poster", "College Poster", "education", "announce", "Notice Board|From The Dean's Office|Student Affairs", "Campus Update|Know Your Campus|Student Guide|Semester Notes", "What every student should know this term.|Key dates, places and people in one place.|Keep this one. You'll need it.", "Read more|Scan for details|Visit the portal", "education"],
  ["education", "school-event", "School Event", "education", "event", "Annual Day|Sports Day|Parents Welcome", "Annual Day|Science Fair|Talent Show|Family Fun Day", "Our students have been preparing for weeks.|Come cheer for every class and every act.|A day of pride for students, parents and teachers.", "Join us|Save the date|Book seats", "education"],
  ["education", "course", "Course", "education", "course", "New Course|Enrolling Now|Certificate Programme", "Master Python|Design Foundations|Data Science Path|Full-Stack Bootcamp", "From first principles to a portfolio project.|Structured lessons, weekly feedback, real assignments.|Learn the skill employers actually ask for.", "Enroll today|View syllabus|Start learning", "education"],
  ["education", "class", "Class", "education", "course", "Weekend Batch|Small Group Classes|New Batch Starting", "Evening Classes|Weekend Batch|Morning Sessions|Crash Course", "Twelve students per batch, so every question gets answered.|Clear teaching, regular tests, steady progress.|Catch up, keep up, get ahead.", "Join the batch|Book a demo|Reserve a seat", "education"],
  ["education", "study-material", "Study Material", "education", "social", "Free Resource|Revision Pack|Exam Ready", "Exam Notes|Formula Sheet|Quick Revision|Topic Wise Guide", "Everything on the syllabus, nothing that isn't.|Short notes for long nights.|Revise in an hour what took a term to learn.", "Download free|Get the notes|Save this post", "education"],
  ["education", "admission-campaign", "Admission Campaign", "education", "course", "Admissions Open|Apply For 2026|Now Accepting Applications", "Admissions Open|Your Future Starts Here|Apply Today|Class Of 2030", "Scholarships available for early applicants.|A campus that takes your ambitions seriously.|Strong faculty, modern labs, proven placements.", "Apply now|Download brochure|Book a campus tour", "education"],
  ["education", "training-program", "Training Program", "business", "course", "Professional Training|Upskilling Programme|Corporate Learning", "Lead With Clarity|Skill Bridge|Manager Essentials|Future Skills", "Practical training your team can use on Monday.|Built with managers, tested with teams.|Short modules. Lasting habits.", "Enroll your team|Request details|Register", "business"],
  ["education", "certification", "Certification", "technology", "course", "Certified Programme|Industry Recognised|Exam Included", "Get Certified|Cloud Practitioner|Certified Analyst|Pro Credential", "A credential recruiters recognise.|Study plan, practice exams and a mentor included.|Prove what you know.", "Start your prep|Enroll now|Check eligibility", "technology"],
  ["education", "educational-announcement", "Educational Announcement", "education", "announce", "Academic Notice|Important Dates|Exam Schedule", "Exam Timetable|Results Day|Holiday Notice|New Semester", "Please note the revised dates below.|Check your section and reporting time carefully.|Questions go to the academic office.", "View schedule|Check details|Contact office", "education"],

  ["social-media", "instagram-post", "Instagram Post", "marketing", "social", "New Post|Swipe To See|Just Dropped", "Fresh Drop|Did You Know?|Monday Mood|Behind The Scenes", "A small idea worth sharing.|Save this for later.|Tag someone who needs to see this.", "Link in bio|Follow for more|Save & share", "social"],
  ["social-media", "instagram-story", "Instagram Story", "marketing", "social", "Today Only|Tap For More|New In", "Swipe Up|Going Live|New Arrival|Poll Time", "Tap through for the full story.|We're live at eight. Set a reminder.|Tell us what you think.", "Swipe up|Tap the link|Reply to join", "social"],
  ["social-media", "linkedin-post", "LinkedIn Post", "business", "social", "Company News|Insight|We're Proud To Share", "A Milestone|Lessons Learned|We're Expanding|Team Spotlight", "Three things we learned shipping this.|Grateful to the team who made it happen.|What we'd tell ourselves a year ago.", "Read the post|Follow our page|Share your view", "business"],
  ["social-media", "facebook-post", "Facebook Post", "marketing", "social", "Community Update|This Week|Happening Soon", "Join The Conversation|This Weekend|Community Picks|Big Thanks", "Thanks for being part of this community.|Here's what's happening near you.|Your stories keep this page going.", "Like & share|Comment below|Learn more", "social"],
  ["social-media", "youtube-graphic", "YouTube Promotional Graphic", "marketing", "social", "New Video|Watch Now|Episode 12", "Watch This First|The Full Breakdown|We Tried It|Ultimate Guide", "Everything explained in twelve minutes.|The mistakes nobody warns you about.|Subscribe so you don't miss part two.", "Watch now|Subscribe|Play the video", "social"],
  ["social-media", "announcement-graphic", "Announcement Graphic", "marketing", "announce", "Announcement|Heads Up|Save The Date", "Big Announcement|Coming Soon|It's Official|Mark Your Calendar", "Something we've been working on is nearly ready.|Details soon. Clear your evening.|You heard it here first.", "Stay tuned|Get notified|Learn more", "marketing"],
  ["social-media", "quote-poster", "Quote Poster", "lifestyle", "social", "Daily Reminder|Words To Keep|Thought Of The Day", "Start Before You're Ready|Small Steps Count|Make It Simple|Stay Curious", "Progress is quiet. Keep going anyway.|Done well beats done perfectly late.|The work teaches you how to do the work.", "Share this|Save for later|Pass it on", "nature"],
  ["social-media", "awareness-campaign", "Awareness Campaign", "nonprofit", "social", "Awareness Week|It Starts With You|Public Service Message", "Speak Up|Every Drop Counts|Check In On Friends|Plant One More", "A small action, repeated, changes a neighbourhood.|Know the signs. Start the conversation.|What you do today protects someone tomorrow.", "Take the pledge|Learn the facts|Share the message", "nonprofit"],
];

export const POSTER_SUBCATEGORIES: PosterSubcategory[] = ROWS.map(([group, slug, name, industry, details, kickers, titles, taglines, ctas, photos]) => ({
  group, slug, name, industry, details,
  kickers: kickers.split("|"), titles: titles.split("|"), taglines: taglines.split("|"), ctas: ctas.split("|"), photos,
}));

/** Facts shown in the small print of a poster, several versions of each so templates differ */
export const DETAIL_SETS: Record<DetailKind, [string, string][][]> = {
  event: [
    [["Date", "14 March 2026"], ["Time", "10:00 AM"], ["Venue", "Main Auditorium"]],
    [["Date", "22 August 2026"], ["Time", "5:30 PM"], ["Venue", "Central Lawn"]],
    [["Date", "6 November 2026"], ["Time", "9:00 AM"], ["Venue", "Innovation Hub"]],
    [["Date", "19 January 2027"], ["Time", "6:00 PM"], ["Venue", "Convention Centre"]],
  ],
  online: [
    [["Date", "9 April 2026"], ["Time", "7:00 PM IST"], ["Platform", "Google Meet"]],
    [["Date", "27 June 2026"], ["Time", "11:00 AM IST"], ["Platform", "Zoom"]],
    [["Date", "3 October 2026"], ["Time", "8:00 PM IST"], ["Platform", "Live Stream"]],
  ],
  offer: [
    [["Offer", "Up to 50% off"], ["Valid till", "31 March"], ["Code", "SAVE50"]],
    [["Offer", "Buy 1 Get 1"], ["Valid till", "Sunday"], ["Code", "BOGO"]],
    [["Offer", "Flat 30% off"], ["Valid till", "15 August"], ["Code", "FEST30"]],
  ],
  hiring: [
    [["Role", "Product Designer"], ["Location", "Bengaluru / Remote"], ["Apply by", "30 April"]],
    [["Role", "Backend Engineer"], ["Location", "Hyderabad"], ["Apply by", "15 June"]],
    [["Role", "Marketing Lead"], ["Location", "Remote"], ["Apply by", "10 September"]],
  ],
  course: [
    [["Starts", "1 July 2026"], ["Duration", "12 weeks"], ["Mode", "Online + Live"]],
    [["Starts", "15 September 2026"], ["Duration", "8 weeks"], ["Mode", "Weekend Batch"]],
    [["Starts", "5 January 2027"], ["Duration", "6 months"], ["Mode", "On Campus"]],
  ],
  launch: [
    [["Launch", "12 May 2026"], ["Where", "Online & In Stores"], ["Access", "Early Sign-Up"]],
    [["Launch", "1 October 2026"], ["Where", "falcon.example"], ["Access", "Waitlist Open"]],
    [["Launch", "20 February 2027"], ["Where", "All Platforms"], ["Access", "Free Trial"]],
  ],
  social: [
    [["Follow", "@yourbrand"], ["Tag", "#MadeWithFalcon"], ["Posted", "Every Monday"]],
    [["Follow", "@studio.name"], ["Tag", "#DailyNote"], ["Posted", "Weekly"]],
    [["Follow", "@your.handle"], ["Tag", "#ShareThis"], ["Posted", "New Series"]],
  ],
  announce: [
    [["Effective", "1 April 2026"], ["From", "The Leadership Team"], ["Contact", "hello@company.com"]],
    [["Effective", "15 July 2026"], ["From", "Head Office"], ["Contact", "info@company.com"]],
    [["Effective", "Immediately"], ["From", "Administration"], ["Contact", "office@campus.edu"]],
  ],
  award: [
    [["Date", "12 December 2026"], ["Venue", "Grand Ballroom"], ["Dress code", "Formal"]],
    [["Date", "28 February 2027"], ["Venue", "City Hall"], ["Dress code", "Black Tie"]],
  ],
  sports: [
    [["Match day", "18 October 2026"], ["Kick-off", "4:00 PM"], ["Ground", "University Stadium"]],
    [["Match day", "7 February 2027"], ["Kick-off", "9:00 AM"], ["Ground", "Sports Complex"]],
  ],
};

export interface PosterSize {
  id: string;
  name: string;
  width: number;
  height: number;
}

/** A-series sizes are at 150 dpi, which prints cleanly and stays light to edit */
export const POSTER_SIZES: PosterSize[] = [
  { id: "a4", name: "A4", width: 1240, height: 1754 },
  { id: "a3", name: "A3", width: 1754, height: 2480 },
  { id: "a2", name: "A2", width: 2480, height: 3508 },
  { id: "square", name: "Square 1080 × 1080", width: 1080, height: 1080 },
  { id: "portrait-4x5", name: "Portrait 1080 × 1350", width: 1080, height: 1350 },
  { id: "story", name: "Story 1080 × 1920", width: 1080, height: 1920 },
  { id: "landscape", name: "Landscape 1200 × 628", width: 1200, height: 628 },
  { id: "poster-3x4", name: "Poster 1080 × 1440", width: 1080, height: 1440 },
  { id: "wide", name: "Wide 1600 × 900", width: 1600, height: 900 },
];
