---
name: task-management
description: Task management workflow for ryvik-work - adds new tasks to TASKS.md with proper ID and creates summaries
model: sonnet
risk_level: LOW
---

# Task Management Skill

## Overview

This skill manages the task workflow for the ryvik-work repository. Use this skill whenever the user asks to add a new task.

## Workflow

When the user requests to add a new task, follow these steps:

### Step 1: Read TASKS.md
First, check the current TASKS.md to determine the next available ID:
```bash
Read /Users/raulanatol/work/ryvik/ryvik-work/TASKS.md
```

The format is:
```
# Listado de tareas pendientes a realizar

Formato: `[ID] - [Título] - [Estado]`
Prioridad: arriba = más prioridad

---

## Tareas

### 001 - Título de la tarea - ✅ COMPLETADO
- Proyecto: ...
- Resumen: ...
- Documentación: summary/001_tarea.md
- Pendiente: ...
```

### Step 2: Assign Next ID
Find the highest ID number and increment by 1. For example:
- If highest ID is 001, next is 002
- If highest ID is 015, next is 016

### Step 3: Add Task to TASKS.md
Add the new task at the TOP of the task list (higher position = higher priority).

Format:
```markdown
### 002 - Título de la nueva tarea - PENDIENTE
- Proyecto: nombre del proyecto
- Descripción: descripción breve
```

### Step 4: When Task is Completed
When you complete a task, follow this additional workflow:

1. **Create summary file** in `ryvik-work/summary/ID_TAREA.md`:
```markdown
# Tarea 001 - Título de la tarea

## Estado: COMPLETADA

## Fecha de completación
Febrero 2026

## Descripción
[What was the problem]

## Solución implementada
[How it was solved - files changed, approach]

## Pendiente / Siguientes pasos
[Any follow-up tasks]
```

2. **Update TASKS.md**:
   - Mark the task as COMPLETADO
   - Add link to summary file
   - Add any pending items

### Step 5: Update AGENTS.md (if needed)
If this is a new skill or pattern that should be documented for future agents, update AGENTS.md.

## Key Files

- **TASKS.md**: `/Users/raulanatol/work/ryvik/ryvik-work/TASKS.md`
- **Summary directory**: `/Users/raulanatol/work/ryvik/ryvik-work/summary/`
- **AGENTS.md**: `/Users/raulanatol/work/ryvik/ryvik-work/AGENTS.md`

## Task ID Format

- Use 3-digit zero-padded format: 001, 002, 003, ..., 010, 011, etc.
- IDs are sequential and never reused

## Priority

- Tasks at the TOP of TASKS.md have HIGHER priority
- New tasks should be added at the TOP unless specified otherwise
