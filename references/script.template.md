---
title: "<TITLE>"
language: "zh"
aspect: "16:9"
theme: "keynote-black"
defaultSlideSeconds: 6
---

# Goal

- What will the viewer understand after this PPT?
- Who is the target audience?

# Data Files

Put data files into `sources/data/` and reference them here.

- kpi: data/kpi.json
- growth: data/growth.csv

# Slides

## Slide 1: Cover

title: "<TITLE>"
subtitle: "One-line subtitle"
notes: "Voiceover notes"

## Slide 2: Section Divider

section: "Section name"
notes: "Voiceover notes"

## Slide 3: Key Points

title: "Key idea"
bullets:

- "Point 1"
- "Point 2"
- "Point 3"
  notes: "Voiceover notes"

## Slide 4: Chart (Exponential Growth)

title: "Exponential growth"
chart: growth
callouts:

- "Callout 1"
- "Callout 2"
  notes: "Explain the chart"

## Slide 5: Summary

title: "Summary"
bullets:

- "Takeaway 1"
- "Takeaway 2"
  cta: "Follow / Like / Subscribe"
  notes: "Closing voiceover"
