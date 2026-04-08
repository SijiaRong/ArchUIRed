---
name: Primary Module Card — Animation
description: "Motion and transition behaviours for the primary card, defining how the card responds to user interaction through smooth visual state changes."
---

## Overview

This module groups all motion behaviours for the primary card. Each sub-module describes one interaction-triggered animation — its trigger condition, what changes, and the timing contract.

Animations are additive: multiple can be active simultaneously as long as they target different properties. All durations and easing values are defined as design tokens so platform implementations can stay consistent.
