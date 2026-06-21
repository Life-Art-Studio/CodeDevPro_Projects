const users = [
    { "id": 1, "name": "Aarav Sharma", "username": "aarav1", "role": "Frontend Developer", "company": "TechNova", "location": "Delhi, India", "avatar": "https://randomuser.me/api/portraits/men/1.jpg", "followers": 1200, "following": 300, "posts": 45, "isOnline": true },
    { "id": 2, "name": "Emily Carter", "username": "emily2", "role": "UI/UX Designer", "company": "PixelCraft", "location": "London, UK", "avatar": "https://randomuser.me/api/portraits/women/2.jpg", "followers": 2150, "following": 420, "posts": 82, "isOnline": false },
    { "id": 3, "name": "Liam Johnson", "username": "liam3", "role": "Backend Developer", "company": "CloudStack", "location": "Toronto, Canada", "avatar": "https://randomuser.me/api/portraits/men/3.jpg", "followers": 980, "following": 210, "posts": 33, "isOnline": true },
    { "id": 4, "name": "Sophia Martinez", "username": "sophia4", "role": "Product Manager", "company": "NextWave", "location": "Madrid, Spain", "avatar": "https://randomuser.me/api/portraits/women/4.jpg", "followers": 1750, "following": 500, "posts": 61, "isOnline": false },
    { "id": 5, "name": "Noah Williams", "username": "noah5", "role": "DevOps Engineer", "company": "InfraCore", "location": "Austin, USA", "avatar": "https://randomuser.me/api/portraits/men/5.jpg", "followers": 1340, "following": 270, "posts": 40, "isOnline": true },
    { "id": 6, "name": "Aisha Khan", "username": "aisha6", "role": "Mobile Developer", "company": "AppSphere", "location": "Dubai, UAE", "avatar": "https://randomuser.me/api/portraits/women/6.jpg", "followers": 2010, "following": 350, "posts": 73, "isOnline": true },
    { "id": 7, "name": "Oliver Brown", "username": "oliver7", "role": "Data Scientist", "company": "DataMind", "location": "Sydney, Australia", "avatar": "https://randomuser.me/api/portraits/men/7.jpg", "followers": 890, "following": 160, "posts": 29, "isOnline": false },
    { "id": 8, "name": "Isabella Garcia", "username": "isabella8", "role": "Graphic Designer", "company": "CreativeBox", "location": "Barcelona, Spain", "avatar": "https://randomuser.me/api/portraits/women/8.jpg", "followers": 1430, "following": 320, "posts": 55, "isOnline": true },
    { "id": 9, "name": "James Anderson", "username": "james9", "role": "Full Stack Developer", "company": "StackFlow", "location": "New York, USA", "avatar": "https://randomuser.me/api/portraits/men/9.jpg", "followers": 1650, "following": 390, "posts": 67, "isOnline": true },
    { "id": 10, "name": "Mia Wilson", "username": "mia10", "role": "Content Strategist", "company": "MediaSpark", "location": "Dublin, Ireland", "avatar": "https://randomuser.me/api/portraits/women/10.jpg", "followers": 950, "following": 210, "posts": 38, "isOnline": false },

    { "id": 11, "name": "Ethan Thomas", "username": "ethan11", "role": "QA Engineer", "company": "BugTrack", "location": "Berlin, Germany", "avatar": "https://randomuser.me/api/portraits/men/11.jpg", "followers": 640, "following": 120, "posts": 21, "isOnline": true },
    { "id": 12, "name": "Charlotte Lee", "username": "charlotte12", "role": "UX Researcher", "company": "InsightLab", "location": "Seoul, South Korea", "avatar": "https://randomuser.me/api/portraits/women/12.jpg", "followers": 1110, "following": 260, "posts": 44, "isOnline": false },
    { "id": 13, "name": "Benjamin Walker", "username": "ben13", "role": "Security Engineer", "company": "SecureNet", "location": "Boston, USA", "avatar": "https://randomuser.me/api/portraits/men/13.jpg", "followers": 720, "following": 140, "posts": 26, "isOnline": true },
    { "id": 14, "name": "Amelia Hall", "username": "amelia14", "role": "Marketing Manager", "company": "BrandLift", "location": "Paris, France", "avatar": "https://randomuser.me/api/portraits/women/14.jpg", "followers": 1880, "following": 510, "posts": 74, "isOnline": true },
    { "id": 15, "name": "Lucas Allen", "username": "lucas15", "role": "Game Developer", "company": "PlayForge", "location": "Tokyo, Japan", "avatar": "https://randomuser.me/api/portraits/men/15.jpg", "followers": 990, "following": 230, "posts": 39, "isOnline": false },
    { "id": 16, "name": "Harper Young", "username": "harper16", "role": "Illustrator", "company": "Artify", "location": "Melbourne, Australia", "avatar": "https://randomuser.me/api/portraits/women/16.jpg", "followers": 2010, "following": 610, "posts": 95, "isOnline": true },
    { "id": 17, "name": "Henry King", "username": "henry17", "role": "System Architect", "company": "CoreLogic", "location": "San Jose, USA", "avatar": "https://randomuser.me/api/portraits/men/17.jpg", "followers": 1230, "following": 340, "posts": 52, "isOnline": true },
    { "id": 18, "name": "Evelyn Wright", "username": "evelyn18", "role": "HR Manager", "company": "PeopleFirst", "location": "Amsterdam, Netherlands", "avatar": "https://randomuser.me/api/portraits/women/18.jpg", "followers": 530, "following": 110, "posts": 19, "isOnline": false },
    { "id": 19, "name": "Daniel Scott", "username": "daniel19", "role": "AI Engineer", "company": "NeuroTech", "location": "San Francisco, USA", "avatar": "https://randomuser.me/api/portraits/men/19.jpg", "followers": 2540, "following": 620, "posts": 101, "isOnline": true },
    { "id": 20, "name": "Scarlett Green", "username": "scarlett20", "role": "Social Media Manager", "company": "TrendWave", "location": "Los Angeles, USA", "avatar": "https://randomuser.me/api/portraits/women/20.jpg", "followers": 1870, "following": 470, "posts": 80, "isOnline": false },

    { "id": 21, "name": "Jack Baker", "username": "jack21", "role": "Cloud Engineer", "company": "SkyStack", "location": "Seattle, USA", "avatar": "https://randomuser.me/api/portraits/men/21.jpg", "followers": 760, "following": 180, "posts": 28, "isOnline": true },
    { "id": 22, "name": "Victoria Adams", "username": "victoria22", "role": "Business Analyst", "company": "InsightPro", "location": "Chicago, USA", "avatar": "https://randomuser.me/api/portraits/women/22.jpg", "followers": 910, "following": 200, "posts": 36, "isOnline": false },
    { "id": 23, "name": "Sebastian Nelson", "username": "seb23", "role": "Software Engineer", "company": "DevCore", "location": "Stockholm, Sweden", "avatar": "https://randomuser.me/api/portraits/men/23.jpg", "followers": 1120, "following": 260, "posts": 41, "isOnline": true },
    { "id": 24, "name": "Grace Carter", "username": "grace24", "role": "Technical Writer", "company": "DocuTech", "location": "Vancouver, Canada", "avatar": "https://randomuser.me/api/portraits/women/24.jpg", "followers": 670, "following": 150, "posts": 24, "isOnline": false },
    { "id": 25, "name": "David Perez", "username": "david25", "role": "Database Administrator", "company": "DataVault", "location": "Mexico City, Mexico", "avatar": "https://randomuser.me/api/portraits/men/25.jpg", "followers": 820, "following": 190, "posts": 30, "isOnline": true },
    { "id": 26, "name": "Chloe Rivera", "username": "chloe26", "role": "UI Designer", "company": "DesignHub", "location": "Lisbon, Portugal", "avatar": "https://randomuser.me/api/portraits/women/26.jpg", "followers": 1420, "following": 360, "posts": 60, "isOnline": true },
    { "id": 27, "name": "Matthew Campbell", "username": "matt27", "role": "Network Engineer", "company": "NetBridge", "location": "Dallas, USA", "avatar": "https://randomuser.me/api/portraits/men/27.jpg", "followers": 510, "following": 120, "posts": 17, "isOnline": false },
    { "id": 28, "name": "Lily Mitchell", "username": "lily28", "role": "Animator", "company": "MotionLab", "location": "Auckland, New Zealand", "avatar": "https://randomuser.me/api/portraits/women/28.jpg", "followers": 1580, "following": 420, "posts": 69, "isOnline": true },
    { "id": 29, "name": "Joseph Roberts", "username": "joe29", "role": "Blockchain Developer", "company": "ChainWorks", "location": "Zurich, Switzerland", "avatar": "https://randomuser.me/api/portraits/men/29.jpg", "followers": 1990, "following": 540, "posts": 88, "isOnline": true },
    { "id": 30, "name": "Hannah Turner", "username": "hannah30", "role": "SEO Specialist", "company": "SearchBoost", "location": "Manchester, UK", "avatar": "https://randomuser.me/api/portraits/women/30.jpg", "followers": 870, "following": 210, "posts": 34, "isOnline": false },

    { "id": 31, "name": "Andrew Phillips", "username": "andrew31", "role": "IT Support Engineer", "company": "HelpDeskPro", "location": "Cape Town, South Africa", "avatar": "https://randomuser.me/api/portraits/men/31.jpg", "followers": 430, "following": 90, "posts": 12, "isOnline": true },
    { "id": 32, "name": "Zoe Parker", "username": "zoe32", "role": "Photographer", "company": "SnapStudio", "location": "Rome, Italy", "avatar": "https://randomuser.me/api/portraits/women/32.jpg", "followers": 2210, "following": 610, "posts": 120, "isOnline": true },
    { "id": 33, "name": "Ryan Evans", "username": "ryan33", "role": "Machine Learning Engineer", "company": "DeepVision", "location": "Boston, USA", "avatar": "https://randomuser.me/api/portraits/men/33.jpg", "followers": 1740, "following": 430, "posts": 76, "isOnline": false },
    { "id": 34, "name": "Natalie Edwards", "username": "natalie34", "role": "PR Manager", "company": "MediaConnect", "location": "Singapore", "avatar": "https://randomuser.me/api/portraits/women/34.jpg", "followers": 990, "following": 260, "posts": 42, "isOnline": true },
    { "id": 35, "name": "Brandon Collins", "username": "brandon35", "role": "Game Designer", "company": "PixelPlay", "location": "Montreal, Canada", "avatar": "https://randomuser.me/api/portraits/men/35.jpg", "followers": 1310, "following": 340, "posts": 58, "isOnline": true },
    { "id": 36, "name": "Leah Stewart", "username": "leah36", "role": "Fashion Designer", "company": "StyleCraft", "location": "Milan, Italy", "avatar": "https://randomuser.me/api/portraits/women/36.jpg", "followers": 2640, "following": 720, "posts": 143, "isOnline": false },
    { "id": 37, "name": "Justin Morris", "username": "justin37", "role": "AR/VR Developer", "company": "RealityLab", "location": "San Diego, USA", "avatar": "https://randomuser.me/api/portraits/men/37.jpg", "followers": 1480, "following": 390, "posts": 63, "isOnline": true },
    { "id": 38, "name": "Audrey Rogers", "username": "audrey38", "role": "Event Manager", "company": "EventFlow", "location": "Bangkok, Thailand", "avatar": "https://randomuser.me/api/portraits/women/38.jpg", "followers": 740, "following": 170, "posts": 27, "isOnline": false },
    { "id": 39, "name": "Kevin Reed", "username": "kevin39", "role": "Robotics Engineer", "company": "RoboCore", "location": "Osaka, Japan", "avatar": "https://randomuser.me/api/portraits/men/39.jpg", "followers": 1600, "following": 410, "posts": 72, "isOnline": true },
    { "id": 40, "name": "Ella Cook", "username": "ella40", "role": "Interior Designer", "company": "SpaceStudio", "location": "Copenhagen, Denmark", "avatar": "https://randomuser.me/api/portraits/women/40.jpg", "followers": 1830, "following": 480, "posts": 84, "isOnline": true },

    { "id": 41, "name": "Nathan Morgan", "username": "nathan41", "role": "Embedded Systems Engineer", "company": "ChipLogic", "location": "Taipei, Taiwan", "avatar": "https://randomuser.me/api/portraits/men/41.jpg", "followers": 640, "following": 150, "posts": 23, "isOnline": false },
    { "id": 42, "name": "Lucy Bell", "username": "lucy42", "role": "Nutrition Coach", "company": "HealthWave", "location": "Sydney, Australia", "avatar": "https://randomuser.me/api/portraits/women/42.jpg", "followers": 920, "following": 210, "posts": 35, "isOnline": true },
    { "id": 43, "name": "Aaron Murphy", "username": "aaron43", "role": "Cybersecurity Analyst", "company": "ShieldNet", "location": "Dublin, Ireland", "avatar": "https://randomuser.me/api/portraits/men/43.jpg", "followers": 780, "following": 180, "posts": 26, "isOnline": true },
    { "id": 44, "name": "Bella Bailey", "username": "bella44", "role": "Makeup Artist", "company": "GlowStudio", "location": "Los Angeles, USA", "avatar": "https://randomuser.me/api/portraits/women/44.jpg", "followers": 3010, "following": 850, "posts": 190, "isOnline": true },
    { "id": 45, "name": "Connor Cooper", "username": "connor45", "role": "Civil Engineer", "company": "BuildTech", "location": "Dubai, UAE", "avatar": "https://randomuser.me/api/portraits/men/45.jpg", "followers": 510, "following": 120, "posts": 15, "isOnline": false },
    { "id": 46, "name": "Stella Richardson", "username": "stella46", "role": "Yoga Instructor", "company": "ZenLife", "location": "Bali, Indonesia", "avatar": "https://randomuser.me/api/portraits/women/46.jpg", "followers": 2200, "following": 640, "posts": 110, "isOnline": true },
    { "id": 47, "name": "Tyler Cox", "username": "tyler47", "role": "Video Editor", "company": "FrameCut", "location": "Atlanta, USA", "avatar": "https://randomuser.me/api/portraits/men/47.jpg", "followers": 990, "following": 240, "posts": 37, "isOnline": false },
    { "id": 48, "name": "Samantha Howard", "username": "sam48", "role": "Podcast Host", "company": "VoiceCast", "location": "Nashville, USA", "avatar": "https://randomuser.me/api/portraits/women/48.jpg", "followers": 1710, "following": 450, "posts": 66, "isOnline": true },
    { "id": 49, "name": "Patrick Ward", "username": "patrick49", "role": "Financial Analyst", "company": "MoneyMap", "location": "Hong Kong", "avatar": "https://randomuser.me/api/portraits/men/49.jpg", "followers": 630, "following": 150, "posts": 22, "isOnline": true },
    { "id": 50, "name": "Daisy Brooks", "username": "daisy50", "role": "Travel Blogger", "company": "WanderNote", "location": "Reykjavik, Iceland", "avatar": "https://randomuser.me/api/portraits/women/50.jpg", "followers": 3420, "following": 910, "posts": 210, "isOnline": false }
]

const container = document.getElementById("usersContainer")

function renderUsers(list) {

    container.innerHTML = ""

    list.forEach(user => {

        const card = document.createElement("div")
        card.className = "user-card"

        card.innerHTML = `
<div class="card-header">

<div class="user-basic">

<img src="${user.avatar}" class="avatar"/>

<div class="user-info">
<h3 class="user-name">${user.name}</h3>
<p class="user-role">${user.role}</p>
</div>

</div>

<button class="toggle-btn">▼</button>

</div>

<div class="card-body">

<p class="company"><strong>Company:</strong> ${user.company}</p>
<p class="location"><strong>Location:</strong> ${user.location}</p>

<div class="stats">
<span>Followers: ${user.followers}</span>
<span>Following: ${user.following}</span>
<span>Posts: ${user.posts}</span>
</div>

<button class="view-profile">View Profile</button>

</div>
`

        container.appendChild(card)

    })

}

renderUsers(users)




const inp = document.querySelector("#searchInput")


inp.addEventListener("input", () => {
    let searchUser = users.filter((user) => {
        return user.name.includes(capitalizeWords(inp.value))
        function capitalizeWords(str) {

            return str
                .split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

        }

    })
    setTimeout(()=>{
        renderUsers(searchUser)
    },500)
})


container.addEventListener("click", (e) => {

    if (e.target.classList.contains("toggle-btn")) {

        const card = e.target.closest(".user-card");

        card.classList.toggle("active");

        if (card.classList.contains("active")) {
            e.target.style.transform = "rotate(180deg)"
        } else {
            e.target.style.transform = "rotate(0deg)"
        }

    }


});



