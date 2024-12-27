---
title: RazorHack CTF 2023 Write-up
author: Alex Prosser
date: 11/20/2023
---

Hello everyone! Recently I was a Game Master for the first annual Razorhack CTF event at the University of Arkansas. I created some of the challenges, mostly web-based ones. I wanted to talk about the creation and thought process behind them.

---

### JungleCalls

:::center
<a href="https://github.com/CodingAP/junglecalls">Link to GitHub</a>
:::

When I was asked about helping out with the CTF, I had two weeks to get something up and running. Keep in mind that this was being developed and tested for months, so the schedule was tight. I spent many hours into the night trying to make this first challenge, which is called JungleCalls. Here was the prose that I wrote up for it...

"Back in the 90s, a messaging app called Jungle Calls was used by RazorPower Co. in the late 90s to communicate between different stations. It seemed to be top of the class back in the day, but now we can't seem to know how to use it. We have a partially tore off page of some marketing material that reads:

***Thank you for purchasing 'Jungle Calls Messaging Service' for use in your company! We are delighted that you chose us for your communication needs. We provide many solutions to all of your problems, including instant text messages reliably coming through all channels, automatic replys, and the all-new server features that allow the chats to be responded to by any device (physical or otherwise). To find more information about this service and how to use it, simply dial...***

...and that was all that we have on us. We somehow got it converted into a modern language to be useful again, but the code isn't the best. Your goal is to look through this web service and find any tid bits that may be important to us. Anything that has the format flag{insert flag here} will definitely suffice. Good luck!"

The first thing that I wanted to do was make something 90s related. Vivid but ugly colors, Comic Sans all day, annoying gifs, anything to remind people of the good ole days (said with sarcasm dripping out my mouth). I think I achieved the look with the homepage...

::image{src="/blog/razorhack-ctf-2023/junglecalls-homepage.png" style="width: 75%"}

The actual challenges, however, was the fun part. I came up with 6 challenges that all revolved around this messaging app. Essentially, it was a sandbox for them to find as many web vulnerabilities as possible. Here is them listed out as well as there flags...

##### Challenge #1 - Hidden in the Forest

***Wow, we really did a bad job at converting this code! Well, that's what happens when using a COBOL-Fortran-C++-Java-Malbolge-JavaScript converter...***

I wanted to make a very simple deobfuscation puzzle as it seemed to be the first thing people see when looking at the page source. To hide the code, I needed something obvious to put it in, but still keep people off the track. That is where Clippy comes in. Suggested by my girlfriend, Clippy bounces around the screen and when you click on him, he spits out a random fact; however, he disables your console.log and that is where the flag is hidden. I used <a href="https://codebeautify.org/javascript-obfuscator">this obfuscator</a> as it allows for very easy deobfuscation. The deobfuscated code looks like this...

```javascript
document.querySelector('#clippy').addEventListener("click", () => {
    alert(sentences[Math.floor(Math.random() * sentences.length)]);
    console.log = () => {};
    console.log("flag{h4ck_4nd_5l45h_43872}");
});
```

##### Challenge #2 - King of the Jungle

***You should probably create an account if you want to get any use out of it, but only the admins have any fun with it...***

After creating an account and signing in, you will be given a JWT token that has some info about the user. For some reason, the JWT has no signature with it and can easily be modified. In there as well is an ADMIN_MODE variable which should be set to false most of the time; however, if you change you cookie to set ADMIN_MODE to true, then you get an admin dashboard with access to all the messages (not directly) and the flag. This comes from another CTF I did a while ago where there was a web challenge named dropchat. It is pretty much the same type of challenge, and I took two of those challenges and put it in JungleCalls.

::image{src="/blog/razorhack-ctf-2023/junglecalls-admin.png" style="width: 50%"}

##### Challenge #3 - A"Cross" the River

***You know, I think the old CEO would have an account on here, here let me see... Ah yes! His username is "ceo-man-123" still...***

Obviously, sending XSS in the messaging part will work. Wonders of 90s technology. Sending images with an onerror attribute will work for this XSS stuff. To get the flag from this user, you need to access their description, which has it hidden by default. The intended way to solve this is to send a XSS payload that grabs ceo-man-123's cookie. I had so many problems getting this to work because I wanted to use puppeteer to be the "user", but it wouldn't work with basic XSS. To get around this, I created a special webpage at **/ceomanmessaging** that only ceo-man-123 can access. This page just shows all message sent to ceo-man-123, which contains the XSS. Then, I left that page on my computer (luckily XSS still works even if you are not focused on the page). 

::image{src="/blog/razorhack-ctf-2023/junglecalls-ceoman.png" style="width: 50%"}

##### Challenge #4 - So many Trees and Logs!

***You know, for a service that hasn't been used in a long time, there is still a lot of stuff left behind... It seems like it has been online for years!***

Each message between users will be stored in **/user_messages**. People can see that messages are stored in this URL because the website will request it to show all messages. Only admins have access to the messages in total through a route under **/user_messages**. Luckily, we already know how to turn ourselves into admins with ADMIN_MODE, but how would we know what user to look for. Well, old_ceo_123 has some messages to other accounts; however, there is so many messages between thousands of employees (10000 to be exact) that there is no way to look through manually. I intend for them to parse the entire message history with some program to find the flag. The flag is **flag{7h4ts_4l0t_0f_l0g5_32121}** and it will be under the log **ceo-man-123!employee4522.log**. This was the other challenge from dropcalls that I implemented.

::image{src="/blog/razorhack-ctf-2023/junglecalls-messages.png" style="width: 75%"}

##### Challenge #5 - Flashy Leaves

***I think my favorite feature is the random button in the global chat, sends a cute emoji that draws me towards it...***

This was my favorite of the JungleCalls challenge. In the global chat, there is a feature to send a random emoji to the chat. Hopefully people spam it because it's cool, but that will also send a request to the page **/flag**, which a computer is connected to as well as a speaker that tries to draw people to it. There, the flag is written on it. That computer is also covered by a tree branch I cut down the night before. The only way to find it will be following the speaker and light, so hopefully no one finds it naturally. I sadly did not take a picture of the branch, but I did give it to the person who solved all my web challenge, kind of like a trophy. The flag is **flag{ju57_a5_I_pl4nn3d_32187}**.

##### Challenge #6 - Timing is Everything

***A very nice bot seems to welcome you everytime you join the global chat, but it's always off with the time...***

In the global chat, everytime someone enters, a bot named **welcome-bot** will say hello and give the current time; however, the time is always wrong (probably some side effect of Y2K). If you message the bot that the time is wrong (specifically you have the word "wrong" in the message), you will be sent the flag. You can also find the flag by searching through all the message logs through ADMIN_MODE.

::image{src="/blog/razorhack-ctf-2023/junglecalls-welcomebot.png" style="width: 100%"}

---

### JS Gauntlet

:::center
<a href="https://github.com/CodingAP/js-gauntlet">Link to GitHub</a>
:::

Funnily enough, these weren't made until after the first day (which ended at 11 pm). So these challenges only had about 5 hours of development. This meant that there was nearly no testing and some of these challenges had bugs (especially the 4th one). I made these challenges because people were having a hard time with the JungleCalls challenges. Those web attacks were as common as looking in the DevTools console, so I made these so that people felt better about my web challenges.

##### Challenge #1 - Where is Anything?

***I would give you a hint, but I don't think I see anything on this site.***

This was super easy to make as it just involved looking through the HTML to find the flag. I just generated a bunch of Lorem Ipsum and turned the visibility to hidden. So, when you first looked, there was no text besides sometimes say "Oooh, I may have found it...". This was solved pretty fast, which is understandable.

::image{src="/blog/razorhack-ctf-2023/jsgauntlet-stage1.png" style="width: 75%"}

##### Challenge #2 - Password Validator

***Try logging in to the system with the username "razorpower". Seems pretty simple...***

I wanted to make a client-side password validator, but I didn't want to make it super simple to break. Lots of times, it would just be rearranging a hardcoded text or unhashing a password. I wanted something that people haven't seen before. That is where making the password out of the script itself would come into play. I generated 15 random indexes into the script's content, and chose that character to be the password (any whitespace or non-alphanumeric characters would be "."). To reverse it, you take the random numbers in the script (the array is called "wtf") and generate the password yourself. Then, if the password was correct, you would get the flag: **flag{t00_m4ny_l3tt3r5_83201}**.

##### Challenge #3 - Button Maze

***Oooooo, this looks like one of the old style text-based RPGs. Why don't you try it?***

This wasn't much of a challenge, it was just something fun that they could do. Funnily enough, people tried to bruteforce by looking through all directions with a program, but I told them it was a complicated maze. All I did was generate the maze below and added buttons to traverse it. It was also pretty simple to develop.

The maze in question (X: starting, o: deadend, O: finish, -/|: path, +: paths crossing)...
```
+-----------+
| X-+-+-+-o |
| | o | | o |
| +--+| | | |
|  O |+-+-+ |
| o+-+    o |
+-----------+
```

Once you reached the end, you will get the flag: **flag{1t5_l1k3_a_c0rn_m4z3_32901}**.

##### Challenge #4 - Puzzle Pieces

***Have you ever tried a 100 piece puzzle? Those are fun. This may not be...***

This was my favorite puzzle to make out of everything, which was weird that it only took me 30 minutes to make. This was also the puzzle with the most amount of bugs. That was fitting as I finished making it 30 minutes before day 2 started. The goal of the puzzle is to align the 1000 rainbow pieces back in their order. I give the user where the piece should go when they highlight it. I did not intend for them to solve it manually, although there was one who did. The solution is a script that simulates the key presses and moves the pieces to its spot. Sadly, only one person actually solved the puzzle that way as two cheesed it (I didn't put protection on the flag URL), and the other manually solved it. Here is the finished puzzle with the flag... 

::image{src="/blog/razorhack-ctf-2023/jsgauntlet-stage4.png" style="width: 100%"}

### Conclusion

Overall I am happy with the creation of these puzzles. It does suck a little that I only had two weeks to work on it all, but I think it pushed me to get something working faster than if I had a longer time period. There was some regrets with the puzzles, though. I wanted to do another challenge in JungleCalls where there would be some file traversing through a Linux server, but I didn't have enough time to implement it correctly. I could allow them to access all files, but I didn't want server code to be exposed. So I scrapped it so I could focus on getting the above 6 done. The only major problem with the challenges was the hosting. I used my student Azure account to host the website, but the guest Wi-Fi that everyone was on did not like it. I had to use many ngrok instances to try and fix the issues, but they never went away. Next time I will get those details ironed out and make even better challenges. Thank you so much for reading!

::image{src="/blog/razorhack-ctf-2023/thanks-for-reading.gif" style="width: 50%"}