// src/data/servicesList.js
// Collects per-service files. Each file imports the default and can override safely.

import { getDefaultService, ALL_DEFAULT_SLUGS } from './servicesDefault';

// Individual service files (all exist below). Edit these, not the defaults:
import tox from './services/tox';
import botox from './services/botox';
import dysport from './services/dysport';
import jeuveau from './services/jeuveau';
import daxxify from './services/daxxify';

import filler from './services/filler';
import juvederm from './services/juvederm';
import rha from './services/rha';
import versa from './services/versa';
import restylane from './services/restylane';

import sculptra from './services/sculptra';
import prp from './services/prp';

import facials from './services/facials';
import glo2facial from './services/glo2facial';
import hydrafacial from './services/hydrafacial';
import peels from './services/peels';
import massage from './services/massage';

import evolvex from './services/evolvex';
import laserhair from './services/laserhair';
import ipl from './services/ipl';
import vascupen from './services/vascupen';
import clearlift from './services/clearlift';
import clearskin from './services/clearskin';
import morpheus8 from './services/morpheus8';
import skinpen from './services/skinpen';
import co2 from './services/co2';

import consultations from './services/consultations';
import reveal from './services/reveal';
import dissolving from './services/dissolving';
import saltsauna from './services/saltsauna';
import opus from './services/opus';
import lashlift from './services/lashlift';
import browwax from './services/browwax';
import men from './services/men';

const REGISTRY = [
  tox, botox, dysport, jeuveau, daxxify,
  filler, juvederm, rha, versa, restylane,
  sculptra, prp, facials, glo2facial, hydrafacial, peels, massage,
  evolvex, laserhair, ipl, vascupen, clearlift, clearskin, morpheus8, skinpen, co2,
  consultations, reveal, dissolving, saltsauna, opus, lashlift, browwax, men,
];

// Safety: if a file is missing, fall back to default for that slug
function withFallback(list) {
  const bySlug = new Map(list.filter(Boolean).map(s => [s.slug, s]));
  ALL_DEFAULT_SLUGS.forEach(slug => {
    if (!bySlug.has(slug)) {
      const fallback = getDefaultService(slug);
      if (fallback) bySlug.set(slug, fallback);
    }
  });
  return Array.from(bySlug.values());
}

export async function getServicesList() {
  return withFallback(REGISTRY);
}

export default getServicesList;
