---
title: RazorHack CTF 2024 - Breakroom Adventure Write-up
author: Alex Prosser
date: 11/2/2024
---

Hello all! This post will being going over the binary exploitation/reverse engineering challenges I made for this year's RazorHack CTF. I have been getting more and more into binaries in terms of cybersecurity as well programming them in general. I like making command line tools especially when it speeds up my productivity (am I turning to the neovim/linux "dark" side?). However, I decided that for this year, I would make a text adventure game. I was inspired by the [Synacor Challenge](https://github.com/Aneurysm9/vm_challenge), which is a virtual machine/reverse engineering puzzle that was created by the same person who made [Advent of Code](https://adventofcode.com/), Eric Wastl!

---

### Introduction

:::center
<a href="https://github.com/CodingAP/breakroom-adventure">Link to GitHub</a>
:::

***Look, I found this old game on one of the computers in the breakroom! It seems to have a good amount of content from what I was looking at, so why don't you look into it and see if it is worth anything. It may even have some easter eggs that no one has seen before!***

During the CTF, we would release challenges at different times to prevent people from being overwhelmed in the first few hours and to focus on the main storyline challenges (none of mine where those). However, we would still have the challenges openers visible, and we didn't do a good job at telling people they were not open yet. So, there were a lot of people asking us *"Where was this breakroom? Is it supposed to have something in it?"* Because of the other physical challenges, they all thought that they needed to find an actual breakroom. I made a note before it was released to say there was no actual breakroom and to wait for the challenge to be release.

Before I go into how to solve the challenges, I also want to give a quick rundown before just so that when we talk about different elements of the game, we are all on the same page. If you do just want to see the challenges, just skip this section. First, the game is a C-complied binary that actually has two versions: one binary that is given to you, and one that is on the server that you have to connect to. The binary given doesn't work unless you provide a *key* file with the key needed to decrypt the game. Putting the wrong key detects that you pirated the game and doesn't allow you to play, putting you in a looping room...

```
== Piracy Room 1 ==
You have seemed to downloaded a pirated version of "Breakroom Adventures"! Please buy the full version to play the game, or suffer the consequences!

There are 1 directions:
- north

What do you do?
go north

== Piracy Room 2 ==
Seriously, there is nothing in this version to explore or do! Just go get the game!

There are 1 directions:
- north

What do you do?
go north

== Piracy Room 3 ==
I'm not kidding! If you keep trying to explore, I will do something!

There are 1 directions:
- north

What do you do?
go north

== Piracy Room 4 ==
Ok, so I can't do anything, but neither can you! There is no end to this!

There are 1 directions:
- north

What do you do?
go north
...
```

There is actually nothing here, I just thought it would be a fun easter egg. If you would like to run the game locally, you must use the key *riddles*, which is explained later on in the post. After that, you are give a prompt to name your adventurer, and then you are ready to go! You will be prompted with your first room...

```
== Gates of Adventure ==
You see a large structure in front of you. It looks like there is an adventure brewing forward...

There are 2 directions:
- north
- south

What do you do?
```

If you want to see what you can execute in terms of commands, you can type *help*...

```
Allowed commands:
- help: bruh what?
- go <direction>: Tries to go in the direction specified
- take <item>: Tries to take the item specified
- inspect <item>: Looks at the item for more details
- use <item>: Tries to use the item specified
- inventory: List items currently in inventory
- exit: Exits the game
```

Funny easter egg here as well, if you go the south direction, you leave the game...

```
== Exit ==
Wow, why did you choose this option? Now it is time to leave you...



Exiting the game...
```

So going forward is a must. You can obviously tell the Synacor Challenge similarities because I use the same room text description structure as it. However, that is as far as it goes as I use different methods for rooms, items, and gameplay. I also made a couple of development tools to aid me in creating the maze and the rooms/items, both of which are in the GitHub under the [dev folder](https://github.com/CodingAP/breakroom-adventure/tree/main/dev).

---

### Just Like The Good Ole Days

***It seems like there is some areas to find as you move forward, so don't hesitate to do some exploring!***

*Solved: 13/33*

I am going to talk about the three challenges that didn't require any cybersecurity knowledge, all you needed to do was to play the game. The first one consists of finishing the maze and reading the flag that is in the description. I will provide the maze as well as the key information as it is needed...

::image{src="/blog/razorhack-ctf-2024/breakroom-adventure/maze.png" style="width: 50%"}

The green in the bottom left is the start, where you enter at the start of the game; The red in the top right is the end, where you need to go. Following the path will give you this room at the end...

```
== The End of The Maze ==
You finally see the exit, with a pathway towards an impressive looking castle. On a sign outside the maze, you see "flag{one_small_step_29103}"...

There are 3 directions:
- north
- south
- west

What do you do?
```

---

### It Seem's Impenetrable...

***Wow, there is a big castle in the distance on the cover art of GameTDB! Maybe you could go find something there in the game.***

*Solved: 10/33*

As you exit the maze, you see a castle as you move forward. However, you need a key to unlock the gate (a rather large key in fact)...

```
== The Castle ==
You stand in front of the entrance for the castle. The gate seems to be locked as indicated by the extremely large padlock...

There are 1 directions:
- south

What do you do?
```

With little other options, you must head back in the maze to find the key. Refering the maze above, the key is located at the yellow spot. After grabbing the key and unlocking the gate, you are now in front of the castle with this description...

```
== The Castle (Unlocked) ==
You stand in front of the entrance for the castle. The gate is down and you see a man in the main room. On the back of the large padlock, you see "flag{did_you_backtrack_48421}"...

There are 2 directions:
- north
- south

What do you do?
```

---

### Answer Be, These Riddles Three

***I've heard that there is this king that will grant all your wishes if you can answer his riddles. This seems kinda cliche for an adventure game, but why not?***

*Solved: 9/33*

Finally, you can meet the king in the castle, and he will give you three riddles to solve. Here is that entire sequence in-game...

```
== The King's Room ==
You are in the middle of a room with a throne. The man sitting on the throne says, "Ah, I see you have made it through the maze. It seems like you are up for a challenge, so why don't you step foward so I can see what you got!"

There are 2 directions:
- north
- south

What do you do?
go north

== Riddle #1 ==
I will state three riddles, and if you get them all correct, I will let you in on a secret. If not, I will kick you out of the castle! Let's begin: In Zork I: The Great Underground Empire, what is the item required to safely cross the rainbow bridge? A. Broomstick B. Jeweled egg C. Crystal sphere D. Bucket of Water

There are 4 directions:
- a
- b
- c
- d

What do you do?
go b

== Riddle #2 ==
Great job! Here is another riddle: In The Hitchhiker's Guide to the Galaxy text adventure, what must you use to avoid dying from the Babel fish-related puzzle? A. Cup of tea B. Towel C. Satchel D. Glass of Water

There are 4 directions:
- a
- b
- c
- d

What do you do?
go b

== Riddle #3 ==
Almost there! Final riddle: In A Mind Forever Voyaging, what is the name of the protagonist, who is a sentient computer simulation? A. PRISM B. PROTEUS C. PERSEUS D. PROMETHEUS

There are 4 directions:
- a
- b
- c
- d

What do you do?
go a

== Your Journey is Over ==
Congratulations! As a prize, I will give you this secret. Technically, my "riddles" were actually just trivia questions, so maybe "riddles" has a use else where? Also, I was told to give you this: "flag{pfft_what_a_gamer_92101}"

There are 1 directions:
- go south

What do you do?
...
```

These are all the flags that require you to play the game (or maybe not, as we will see later)

---

### Just a Peek

***I've always wondered what the text adventure will look like in the code itself, maybe you can explore the binary to find something cool?***

*Solved: 6/33*

The rest of the challenges all require you to either reverse the game's data/code, or to run an exploit to get to sequences not normally accessible. The first of these challenges just needs a simple decompilation, or even running "strings". After such, you will see the flag in memory. Here is an example Linux command to see the flag...

```bash
> strings ./breakroom_adventure | grep flag

...
flag{uber_hacker_number_one_45391}
...
```

This is actually the string stored in the user's name before it is overwritten by the input.

---

### The River is Overflowing!!!

***I've managed to look into a small part of the code myself, and there seems to be a debug function that isn't called anywhere that can show a cool easter egg!***

It seems that after this, no one was able to solve the rest, which is understandable as I made it to where you must solve them linearly (all of my challenges had this, and I don't think that it benefitted this one at all). This is also where I would say the first true CTF trick is used: buffer overflow. If you were to look at the code, all inputs used *fgets()* to grab the user's input except in one place: the user's name prompt. That only uses *gets()*, which means that you can attack it. Also in the code, alluded by the prompt, is a debug function that allows you print out a flag...

```c
void getFlag() {
    char *flag = readFile("flags/flag_63904");
    printf("%s\n", flag);
}

void getNameInput() {
    char nameBuffer[32];
    printf("Enter your name, adventurer: ");
    gets(nameBuffer);
}
```

I actually don't do anything with the name inputted, I just wanted a way to have a seperate prompt for a buffer overflow attack. If you have seen these types of challenges before, it it pretty straightforward. If not, here is a step by step tutorial on how to execute a buffer overflow to overwrite the return address:

1. Use a debugger to run and find the *getFlag()*'s address (I use GDB with PEDA as it has built in tools to help the next step)
2. Craft a payload that uses enough padding to put the function's address where the return address pointer is in stack memory
3. Overflow the name's input with enough characters to start overwriting the stack (this is done through a script because the characters aren't ASCII characters anymore)
4. When the program is now done with *getNameInput()*, it returns to the *getFlag()*, prints the flag, and crashes

The flag for this one is ***flag{it_couldnt_be_contained_63904}***

If you need more explanation, or specific code to see, go to this [write-up](https://nightxade.github.io/ctf-writeups/writeups/1337/picoCTF/binary-exploitation/buffer-overflow-2.html) as I used it to help create this challenge.

To make this as easy as possible, I essentially turned off any application security with no stack protector, using 32-bit gcc, and execstack flag set. I also tried to make sure the memory doesn't move a lot so that attacks are more consistent. Here is the *checksec*, which tells what securities are on an executable...

```
RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      Symbols         FORTIFY Fortified       Fortifiable     FILE
Partial RELRO   Canary found      NX enabled    No PIE          No RPATH   No RUNPATH   2688) Symbols     No    0               0               ./breakroom_adventure
```

*Solved: 0/33*

---

### A Duel You Say...

***Looking on Reddit, there seems to be an unbeatable goblin in the game, but it can't be that hard right?***

*Solved: 0/33*

This challenge consists of a goblin that you can kill in the game. In the maze above, you can see the remaining two points: orange is where the goblin is, and blue is where a sword is to kill it. After collecting the sword, you can go to the goblin and try to kill it. However, most of the time, the goblin will win...

```
== A Fight in The Maze ==
You swing your sword, and the goblin takes it as a challenge! Sadly, the goblin gets to you first... YOU HAVE DIED!



Exiting the game...
```

In the game, there is a 1/100 chance to defeat the goblin. While it is possible to just keep trying and eventually get it, there is a much easier way. Because computers cannot actually generate truly random numbers, we have to settle for pseudorandom numbers, which can be calculated before hand. In the beginning of the program, the seed for the RNG is set to the current epoch time (how many seconds it has been since January 1, 1970), and the random call for the goblin kill is only called once. Knowing all this (probably from decompiling the program), you can try to find when the random chance will hit with another program. Here is one that I wrote to find the next time over 10000 seconds (note that the condition to win is to roll the number 69)...

```c
#include "stdio.h"
#include "stdlib.h"
#include "time.h"

int generateRandomNumber(time_t timestamp) {
    srand(timestamp);
    return (rand() % 100) + 1;
}

int main() {
    time_t start = time(0);
    for (int i = 0; i < 10000; i++) {
        if (generateRandomNumber(start + i) == 69) {
            printf("%d\n", start + i);
            break;
        }
    }

    return 0;
}
```

If you run the program on the right second and try to kill the goblin now, you get a different response...

```
== A Fight in The Maze ==
You swing your sword, and the goblin takes it as a challenge! Luckily, you get to it first! In it's blood, it spells out "flag{one_of_these_will_work_24431}"!

There are 1 directions:
- go north

What do you do?
```

---

### A Hidden Path

***I don't think that you can find anymore easter eggs, there just doesn't seem to be a place to hide them. The only way to confirm is to look at the source code, but we can't get a full copy, right?***

*Solved: 0/33*

For the last challenge of this set, you need to take a look at the game data somehow. In the decompiled code, you see a two data strings that are XOR encrypted. The biggest one is the actual game, and the other is the pirated version. As stated before, the key is *riddles*, which will decrypt the game data and allow the game to run normally. The intended way I wanted users to figure this out is to finish the game and have the king heavily reference the word *riddles* to indicate that it is important for something. Another way, which is more CTF-ish, is to run a known-plaintext attack on the data. Because you know what the data should be (because you are able to play the unencrypted game), you are able to reverse the process of the XOR and get the game data. In this data, you should be able to grab every flag except for the binary exploitation flags, including the one for this challenge. As stated, there may be a hidden path, and if you look at the last room node, you can see *Friendship Forever*, with the flag. If you want the entire game's data now, it is in the GitHub under [map.txt](https://github.com/CodingAP/breakroom-adventure/blob/main/map.txt)...

```
...
113
Friendship Forever
You happen to stumble upon another dimension and drop into the "Friendship" world! It is very annoying, as all you hear are voices chanting "flag{friendship_always_works_11259}"...


...
```

---

### Conclusion

This was another fun set of challenges to make! I had a harder time creating these as it is my first set with a binary rather than a website. I also regret using the linear approach as it made the exploration aspect harder to do, as you can find another flag without finishing the flag before it technically. I don't think it would have mattered too much, considering no one actually even reversed the game data to begin with, but it could have led to more interesting results. Anyways, thank you all for reading! If you haven't yet, take a look at my other write-ups for RazorHack 2024!

- [JS Gauntlet 2 Write-Up](https://codingap.github.io/blog/posts/razorhack-ctf-2024-js-gauntlet-2/)
- [Format Frenzy Write-Up](https://codingap.github.io/blog/posts/razorhack-ctf-2024-format-frenzy/)