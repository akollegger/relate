---
layout: post
title:  "Introducing Neo4j Relate"
date:   2020-10-17
categories: tutorial
author: akollegger
---


![Three phases helped by Neo4j Relate]({{ '/assets/posts/intro-to-relate-what.png' | relative_url }} "Code, test, deploy with Neo4j Relate"){: width="30%" style="float: right"}
Neo4j Relate is a framework of tools, services and libraries for working with Neo4j, giving
the world's best graph database a world-class developer experience.

Neo4j Relate helps in three phases of your work.

- Code: simple, on-demand provisioning of Neo4j DBMS
- Test: integrating Neo4j into your end-to-end tests
- Deploy: monitoring and querying of production databases

Let's try it out. We'll use the `@relate/cli` command line tool running straight from `npx` to skip installation ([what's npx?](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b)). Follow along or check out the finished project.

## Code: add Neo4j DBMS to your [stack](https://stackshare.io/neo4j)

![Get Neo4j]({{ '/assets/posts/intro-to-relate-get-neo4j.png' | relative_url }} "Get Neo4j"){: width="20%" style="float: left; margin-right: 2em"}

All projects, from quick experiments to global industry disruptions, need a technology stack that is right for
the job. When you need to add a database, Relate makes it effortless to get Neo4j.

Start with the one-time setup of a data environment, then install a Neo4j DBMS into it and start the DBMS.
For each step accept the defaults when prompted.

```
# initialize a local data environment (use this semi-secret access code: r31473)
npx @relate/cli env:init --name=relate-tutorials --type=LOCAL

# install Neo4j into the environment
npx @relate/cli dbms:install 4.1.3 -e relate-tutorials -n intro

# start the DBMS
npx @relate/cli dbms:start -e relate-tutorials intro
```

A few seconds later Neo4j is up and running. Check the status:

```
npx @relate/cli dbms:info
```



## Test: mock a database, modify it, check the results



## Deploy: use Neo4j Browser

## Cleaning up

Remove all resources managed by Neo4j Relate.

MacOS:

```
rm -rf '~/Library/Caches/com.Neo4j.Relate/' '~/Library/Application Support/com.Neo4j.Relate/'

```