# AI-Powered Build Checklist: The 4-Step Control Blueprint

> Build What You Need. Own Everything. Using AI.

## 💡 Pro Tips
1. **Don't Overbuild**: MVP in 20 hours. Period.
2. **Copy Shamelessly**: Use their UI as inspiration
3. **Focus on YOUR Needs**: Build what YOU need, not what everyone needs
4. **Use AI Aggressively**: Let Claude/GPT write 80% of code
5. **Ship Daily**: Deploy every day, even if broken

---

## 🚨 Common Pitfalls to Avoid
- [ ] Don't try to build every feature on day 1
- [ ] Don't worry about scaling to millions (yet)
- [ ] Don't get stuck on perfect code
- [ ] Don't build features you won't use

---

## 🎯 Phase 1: TARGET (Pick Your Tool)

### User Flow Analysis
- [ ] Pick ONE tool to reverse-engineer first
- [ ] Map the main user journey (signup → core action → value)
- [ ] List top 5 features you actually use
- [ ] Define the ONE core feature that makes this tool valuable
- [ ] List nice-to-have features for later
- [ ] List top 3 features they DON'T have that you need
- [ ] Document their pricing model and restrictions
- [ ] Screenshot key UI/UX elements you like
- [ ] **Result**: Create a 1-page PRD (Product Requirements Doc)

---

## 🔨 Phase 2: BUILD IT (20 Hours Max)

### Environment Setup (2 hours)
- [ ] Open Cursor IDE
- [ ] Install Claude Code extension
- [ ] Create CLAUDE.md with project context

```
7 Claude rules
1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.
```
- [ ] Create new project folder

```
“I’m looking to build a simple [community platform like skool]

User flow : 
Landingpage > ...

I’d like it to be built with nextjs. shadcn/ui. before we start building this out though, I want to do a little planning with you. I first want you to make a project plan for this. 

Inside @tasks/todo.md.please build an in depth plan for the app. Have high level checkpoints for each major step and feature, then in each checkpoint have a broken down list of small tasks you'll need to do to complete that checkpoint. Also in this plan include instructions we will give to a marketing background agent, a Researcher agent that will research user needs, and a feature planning agent that will plan the roadmap for us. We will then review this plan together. order is same. 
5 stage : Project setting > UI basic > Database > Backend > polishing / publising. You already have our @tasks/PRD.md. but follow this 5 stage.
```

---

## ⚡ Phase 3: ADD FEATURES (Your Secret Sauce)

### Feature Prioritization
- [ ] List all features the original tool is missing
- [ ] Pick top 3 to implement first

### Custom Features Examples
- [ ] Remove all usage limits
- [ ] Add that "too complex" feature they rejected
- [ ] Build the $50/month integration for free
- [ ] Add export options they don't have
- [ ] Create admin tools they charge extra for

### AI Enhancement
- [ ] Add AI-powered features:
  - [ ] Auto-suggestions
  - [ ] Content generation
  - [ ] Smart categorization
  - [ ] Predictive actions
- [ ] Use OpenAI/Anthropic APIs strategically

### Performance Optimization
- [ ] Add caching where needed
- [ ] Optimize database queries
- [ ] Implement pagination
- [ ] Add search functionality
- [ ] Monitor with Vercel Analytics

---

## 🚀 Phase 4: OWN CONTROL (Migration & Launch)

### Data Migration
- [ ] Export all data from old tool

### Testing Period 


---

**Remember**: The goal isn't to build perfect software. It's to own your tools, control your data, and stop being held hostage by SaaS companies.

**You don't need permission. You need 20 hours and this checklist.**

Ready to build? Let's own our tools. 🚀