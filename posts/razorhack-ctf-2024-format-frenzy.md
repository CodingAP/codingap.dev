---
title: RazorHack CTF 2024 - Format Frenzy Write-up
author: Alex Prosser
date: 11/2/2024
---

Hello all! This was my first set of challenges developed for RazorHack 2024, and these were also the simplest. This was a way to get a lot of ideas into the CTF because I didn't have time to flesh these all out into their own challenges (I also had to cut stuff like malware inspection and virtualization, but I can explore those ideas for another time).

---

### Introduction

:::center
<a href="https://github.com/CodingAP/format-frenzy">Link to GitHub</a>
:::

***Oh, thank goodness you are here. An intern downloaded a virus while trying to fix the breakroom computer (to think that "Totally Real Anti-Virus 2034" would not be what it seems). We managed to recover most of the data, but we have some files that got scrubbed of all the metadata! We will have some of our team members try to remember what the data is, but can you investigate the files to see WHAT you can find?***
***~ IT Team***

File forensics sounds a lot cooler than what it is here. Most of the challenges consisted of trying to figure out what the file format is and putting it through the correct program to see what the flag should be. Similarly to [JS Gauntlet 2](https://codingap.github.io/blog/posts/razorhack-ctf-2024-js-gauntlet-2/), this was also the IT Team giving you tasks to do.

---

### Graphics mean Everything

***I think this file came from the boss's recent vacation, so I WOULD treat with the upmost respect and totally not post it in the Teams chat afterwards...***
***~ Stanley from IT***

*Solved: 21/33*

Basically, I created an image that had the flag, removed the .png extension, and that was it. Most of the challenges can be solved with *file* in Linux as most file formats have bytes at the beginning as identification. I also tried to make the storyline work throughout the challenges, especially for the last challenge. The flag is **flag{oh_what_a_silly_guy_43782}**.

::image{src="/blog/razorhack-ctf-2024/format-frenzy/challenge1.png" style="width: 75%"}

---

### Plastic, amirite?

***If I remember correctly, this may be from an instruction set of some kind, but I can't put MY finger on it...***
***~ Sven from IT***

*Solved: 20/33*

This is one of the challenges that I wanted to expand upon, but chose not to due to lack of time. LEGO has an app called [stud.io](https://www.bricklink.com/v3/studio/download.page) where you can create builds and instructions for those builds so that you can create you own custom LEGO sets. Not only is it fun to "pirate" LEGO sets and build them digitally, but this can also create fun visuals. I wanted a PDF file for these challenges, and I thought it would be cute to see LEGO instructions instead of a simple Word document or something like that. The flag is **flag{lego_is_fun_25539}**.

::image{src="/blog/razorhack-ctf-2024/format-frenzy/challenge2.png" style="width: 75%"}

---

### My zipper got stuck :(

***Oi oi oi, I reckon if we can crack into this bugger, we can find the true meaning of life. I'm just ribbing ya, but if my NAME isn't Alfred the III Jr., you can fix this in a jiffy...***
***~ Alfred from IT***

*Solved: 19/33*

A nested ZIP file was an obvious choice for this type of challenge, especially if you choose to remove all the extensions like I did. This was a little confusing to create, especially since I couldn't rename files to the same thing, but I made due. I also chose a British guy to present this one because I thought it would be funny to subvert the Russian nesting doll joke. Speaking of the British guy, this was actually my character for the CTF. The game masters decided to dress up as employees of this fictitious company, and I wore a top hat and mustache (for the start). Anyways, the flag is **flag{british_nesting_dolls_38472}**.

---

### Additive Manufacturing in my Office?!?!

***I really need this file to BE recovered as I have all my money in this business that specializes in creating custom parts for office desks and if this file is lost, I will lose millions!!!***
***~ John from IT***

*Solved: 16/33*

I don't remember where I saw this, but this was a previous challenge that I solved for another CTF. I liked it enough to copy it over to this set of challenges my self. All I did was using Tinkercad to create a 3D printable model that consisted of the flag. Since I knew that it was easy to see .gcode files online, I made a harder vector file challenge later on as well. The flag is **flag{4d_printing_37182}**.

::image{src="/blog/razorhack-ctf-2024/format-frenzy/challenge4.png" style="width: 75%"}

---

### Homemade Code Right Here

***My mom apparently sent this to me with the message, "I wanted to do something that you would be familiar with, but your technologies are too complicated. I am happy though that I made it from Scratch, so IF you like it, please call back." Maybe recover this for some happy thoughts...***
***~ Justin from IT***

*Solved: 15/33*

I just thought it would be funny to hide something in a Scratch project. People don't normally export them to files, so this was just a fun fact type of challenge. The Scratch exported file is actually a zip file with all the content needed to run it. Because of this, I had to split up the flag so that people couldn't just *grep* the flag easily (I mean you still can, but it would be harder). The flag is **flag{just_like_mom_makes_it_38219}**.

::image{src="/blog/razorhack-ctf-2024/format-frenzy/challenge5.png" style="width: 75%"}

---

### Son, Git in here!

***So, it turns out that our website build was also in the files that got wiped, but we really need to get that back or else we have to start over, and we made so progress on our FIRST build that we really don't want to do that...***
***~ Sven from IT***

*Solved: 15/33*

I also saw this, but I remember getting it from picoCTF because I thought it was cool how Git keeps track of stuff not just using Github/Azure/Gitlabs, but how the git file system works as well. It is also not a simple *grep* either because I couldn't find the raw text for the commit message anywhere. I just had to use *git log* though to find the messages, so I think it is worthy enough of a challenge. Fun fact: this is the same repository as the current one used to store all the files for the challenge. I decided to repurpose it instead of deleting it. The flag is **flag{im_commiting_to_be_better_54821}**.

::image{src="/blog/razorhack-ctf-2024/format-frenzy/challenge6.png" style="width: 75%"}

---

### Back in the 80s...

***I remember when I was a wee lad back in 1988 when I got into developement of my first game console, but my old age has made me forget the name. This file maybe has LETTERS of my first game, but I'm not for sure... ***
***~ Alfred from IT***

*Solved: 9/33*

Because I couldn't do a hackable game or a virtualization challenge, I decided that this was the next best thing. NES graphics are not that hard to understand after watching a 2 hour video series about them, but if you use YYCHR to view them, it makes it very easy to edit. I also added different colors to the text so that if you wanted to make a custom palette, you can! The flag is **flag{now_youre_playing_with_power_07291}**.

::image{src="/blog/razorhack-ctf-2024/format-frenzy/challenge7.png" style="width: 75%"}

---

### I'm Not Taking This Litely

***This malware seemed to have corrupted everything! First our website build, now our database! How are we going to produce state-of-the-art technologies if everything is gone. We WERE going to restart, but maybe you can help again...***
***~ John from IT***

*Solved: 8/33*

I actually have been using SQLite in a couple of recent projects because of how easy it is to setup. While it is not the best in terms of enterprise software (I even poke fun of that in the prose), hobby projects are a great fit for how fast it is to setup and use. Anyways, this is just a .db file with a table with 10000 entries. You have to find the flag in a sea of *not the flag*'s (tbf all you need to do is ctrl-f "flag{", sooooooo). The flag is **flag{billions_of_rows_49812}**.

::image{src="/blog/razorhack-ctf-2024/format-frenzy/challenge8.png" style="width: 75%"}

---

### In both Magnitude and Direction

***This seems to be from some sort of vector processing unit, but it isn't from anything modern. However, our version of the arcade game Asteroids that we keep in the break room seems to be SWITCHED with a toaster, and I can't help to think those are related...***
***~ Justin from IT***

*Solved: 7/33*

This was that harder vector challenge I mentioned earlier. I actually wanted this to be the virtualization challenge, where you had to recreate the [Quadrascan](https://en.wikipedia.org/wiki/QuadraScan) instruction set to create a vector image, but I think that would be way too difficult for a challenge like this (although I am ready to implement something like that for a different challenge). Instead, I just created a list of points that the participant would have to parse and draw manually, which is still more difficult that all the other challenges as they actually have to program stuff. The flag is **flag{despicable_me_16_is_the_best_38103}** (lot of Vector from Despicable Me jokes obviously).

::image{src="/blog/razorhack-ctf-2024/format-frenzy/challenge9.svg" style="width: 75%"}

---

### Under Lock and Key

***This last file is really important, and we have identified it... but it seems that the malware specifically targetted it and locked it under out noses. That pesky intern said, "The malware seemed to PASSWORD-encode the file and placed a riddle around to figure it out". Can you help us one last time?***
***~ Stanley from IT***

*Solved: 3/33*

The final challenge is one where I wanted to utilize all the other challenges before. I was thinking metadata between the 9 previous files to construct one final file, but I couldn't think of a clean way to do that. Instead, I went with a final riddle that had to be constructed out of all the previous proses. If you notice, there are words that are CAPITALIZED, and if you put them together, you get ***WHAT WOULD MY NAME BE IF FIRST LETTERS WERE SWITCHED PASSWORD***. Because I put my author name in all of the challenges, hopefully they realize that the password is *plexarosser* (I would also imagine some would use a password cracker, but that is no fun). I didn't put a challenge after that as I thought it would be a nice ending. The flag is **flag{conglaturation_a_winner_is_you_73281}**.

---

### Conclusion

Thank you all for reading! If you haven't yet, take a look at my other write-ups for RazorHack 2024!

- [JS Gauntlet 2 Write-Up](https://codingap.github.io/blog/posts/razorhack-ctf-2024-js-gauntlet-2/)
- [Breakroom Adventure Write-Up](https://codingap.github.io/blog/posts/razorhack-ctf-2024-breakroom-adventure/)