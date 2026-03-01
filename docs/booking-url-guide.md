# RELUXE Booking URL Parameter Guide

Two booking URL systems exist: the **Start Flow** (`/start/...`) and the **Direct Book** (`/book/...`).

---

## 1. Start Flow — `/start/{path}`

The Start Flow is the guided booking experience. It supports URL parameters to pre-fill selections.

### Base URLs

| Path | Description |
|------|-------------|
| `/start/provider` | "I have a provider I want to see" |
| `/start/concern` | "I have a concern that I need help with" |
| `/start/not-sure` | "I don't know where to start" |
| `/start/all-options` | "I want to see all the options" |

### Query Parameters

| Param | Short | Description | Example |
|-------|-------|-------------|---------|
| `location` | `l` | Pre-select location | `?l=westfield` |
| `provider` | `p` | Pre-select provider | `?p=hannah` |
| `category` | `c` | Pre-select service category | `?c=tox` |
| `service` | `s` | Pre-select specific service | `?s=hydrafacial` |
| `date` | `d` | Pre-select date | `?d=2026-03-15` or `?d=3/15/2026` |
| `date_end` | `d2` | End of date range | `?d2=2026-03-20` |
| `options` | `o` | Skip Boulevard options step | `?o=n` |

---

### Options Step (Skip)

When Boulevard shows an optional "Choose Your..." step (e.g., Choose Your Tox brand), `?o=n` auto-clicks the **Skip** button to go straight to date/time selection.

| Value | Result |
|-------|--------|
| `n` | Skip the options step |
| `no` | Skip the options step |
| `skip` | Skip the options step |

**Examples:**
```
/start/provider?p=hannah&s=tox&l=westfield&o=n
/book/westfield/tox?o=n
```

---

### Location Values

| Value | Alias | Result |
|-------|-------|--------|
| `westfield` | `w` | Westfield location only |
| `carmel` | `c` | Carmel location only |
| `any` | `all`, `no-preference` | Both locations (no preference) |

**Examples:**
```
/start/provider?l=westfield
/start/provider?location=carmel
/start/provider?l=w
```

---

### Provider Values

Providers are matched **flexibly** — you can use their slug, full name, or just their first name. Matching is case-insensitive and ignores special characters.

| What you type | How it matches |
|---|---|
| `hannah` | First name match |
| `hannah-jones` | Slug match (if that's their slug in the staff table) |
| `Hannah Jones` | Full name match |

**Current Providers** (use first name for simplicity):

| Provider | Value to Use | Role |
|----------|-------------|------|
| *First Available* | `any` | Skips provider selection — auto-picks best match |
| Krista Spalding | `krista` | Nurse Practitioner Injector |
| Hannah | `hannah` | Nurse Injector |
| Alexis | `alexis` | Nurse Injector |
| Melissa | `melissa` | Nurse Injector |
| Anna | `anna` | Injector |

**"Any" aliases:** `any`, `all`, `first-available`, `no-preference` all work.

> **Note:** Provider slugs are pulled from the `staff` table in Supabase. If new providers are added, their slug or first name will work automatically. Check `/admin/team` for the full current roster.

**Examples:**
```
/start/provider?p=hannah
/start/provider?p=krista&l=westfield
/start/provider?p=alexis&c=tox
/start/provider?provider=hannah&location=carmel&category=filler
```

---

### Service Category Values (`?c=` or `?category=`)

These map to the treatment bundle categories shown in the booking flow.

| Value | Display Name |
|-------|-------------|
| `tox` | Tox (Botox, Dysport, Daxxify, Jeuveau) |
| `filler` | Dermal Fillers |
| `sculptra` | Sculptra |
| `morpheus8` | Morpheus8 |
| `microneedling` | Microneedling (SkinPen) |
| `ipl` | IPL Photofacial |
| `laser-hair-removal` | Laser Hair Removal |
| `hydrafacial` | HydraFacial |
| `glo2facial` | Glo2Facial |
| `facials` | Signature Facials & Peels |
| `massage` | Massage |

**Examples:**
```
/start/provider?p=hannah&c=tox
/start/provider?p=alexis&c=filler
/start/concern?c=morpheus8
/start/provider?p=krista&c=tox&l=westfield
```

---

### Service Values (`?s=` or `?service=`)

Service values use the same slugs as categories above, but can also reference specific service slugs from the booking map.

| Value | Service |
|-------|---------|
| `tox` | Tox (Botox/Dysport/Daxxify/Jeuveau) |
| `filler` | Dermal Fillers (RHA) |
| `sculptra` | Sculptra |
| `morpheus8` | Morpheus8 |
| `microneedling` | SkinPen Microneedling |
| `ipl` | IPL Photofacial |
| `laser-hair-removal` | Laser Hair Removal |
| `hydrafacial` | HydraFacial |
| `glo2facial` | Glo2Facial |
| `facials` | Signature Facial |
| `massage` | Massage |

---

## 2. Direct Book — `/book/{service}`

The Direct Book URLs open the Boulevard booking widget directly (no guided flow). These bypass the Start Flow and go straight to the Boulevard cart.

### Format

```
/book/{service-slug}
/book/{location}/{service-slug}
```

### Location in Path

| URL | Behavior |
|-----|----------|
| `/book/tox` | Uses saved location preference (or prompts to choose) |
| `/book/westfield/tox` | Forces Westfield location |
| `/book/carmel/tox` | Forces Carmel location |
| `/book/tox?loc=westfield` | Also forces Westfield (query param) |

### All Direct Book Service Slugs

#### Injectables
| Slug | Service |
|------|---------|
| `tox` | Wrinkle Relaxers (all brands) |
| `botox` | Wrinkle Relaxers (alias for tox) |
| `dysport` | Wrinkle Relaxers (alias for tox) |
| `jeuveau` | Wrinkle Relaxers (alias for tox) |
| `daxxify` | Wrinkle Relaxers (alias for tox) |
| `filler` | Dermal Fillers |
| `rha` | Dermal Fillers (alias) |
| `lip-flip` | Lip Flip |
| `filler-dissolving` | Filler Dissolving |
| `sculptra` | Sculptra |
| `prp` | PRP Treatment |
| `facialbalancing` | Facial Balancing Consult |

#### Consultations
| Slug | Service |
|------|---------|
| `consult` | Consultations & Follow-Ups (menu) |
| `tox-consult` | Tox Consultation |
| `refine` | Refine Consultation |
| `remodel` | Remodel Consultation |

#### Facials & Peels
| Slug | Service |
|------|---------|
| `facials` | Facials & Peels (menu) |
| `signature-facial` | Signature Facial |
| `biorepeel` | BioRePeel |
| `the-perfect-dermapeel` | The Perfect DermaPeel |
| `chemical-peel` | Chemical Peel |
| `dermaplane` | Dermaplane |
| `lash-lift-tint` | Lash Lift & Tint |
| `teen-facial` | Teen Facial |

#### Premium Facials
| Slug | Service |
|------|---------|
| `hydrafacial` | HydraFacial (menu) |
| `glo2facial` | Glo2Facial (menu) |

#### Microneedling
| Slug | Service |
|------|---------|
| `morpheus8` | Morpheus8 |
| `skinpen` | SkinPen Microneedling |

#### Laser
| Slug | Service |
|------|---------|
| `opus` | Opus Plasma |
| `ipl` | IPL Photofacial |
| `laser-hair-removal` | Laser Hair Removal |
| `clearlift` | ClearLift |
| `clearskin` | ClearSkin |
| `co2` | CO2 Laser |
| `vascupen` | VascuPen |

#### Massage
| Slug | Service |
|------|---------|
| `massage` | Massage (menu) |
| `60-minute-choice-massage` | 60-Min Choice Massage |
| `intromassage` | Intro Massage |
| `massageintro` | Intro Massage (alias) |

#### Body & Wellness
| Slug | Service |
|------|---------|
| `body-contouring` | Body Contouring (EvolveX) |
| `salt-sauna` | IR Sauna & Salt Booth |

---

## 3. Combined Examples

### Sending a patient to book Tox with Hannah at Westfield
```
/start/provider?p=hannah&c=tox&l=westfield
```

### Sending a patient directly to the Tox booking widget at Carmel
```
/book/carmel/tox
```

### Sending a patient to see Alexis for Filler (any location)
```
/start/provider?p=alexis&c=filler
```

### Sending a patient to browse all facials at Westfield
```
/book/westfield/facials
```

### Sending a patient to book a Signature Facial at Carmel
```
/book/carmel/signature-facial
```

### Sending a patient to a specific provider for a Morpheus8 consult
```
/start/provider?p=krista&c=morpheus8&l=westfield
```

### Full URL (on reluxe.com)
```
https://reluxe.com/start/provider?p=hannah&c=tox&l=westfield
https://reluxe.com/book/westfield/tox
```

---

## Quick Reference Cheat Sheet

```
LOCATION:   ?l=westfield | ?l=carmel | ?l=any
PROVIDER:   ?p=any | ?p=hannah | ?p=alexis | ?p=anna | ?p=krista | ?p=melissa
CATEGORY:   ?c=tox | ?c=filler | ?c=sculptra | ?c=morpheus8 | ?c=microneedling
              ?c=ipl | ?c=laser-hair-removal | ?c=hydrafacial | ?c=glo2facial
              ?c=facials | ?c=massage
SERVICE:    ?s=tox | ?s=filler | ?s=hydrafacial | ?s=facials | (same as category)
DATE:       ?d=2026-03-15 | ?d=3/15/2026
OPTIONS:    ?o=n (skip Boulevard's optional choice step)
```
