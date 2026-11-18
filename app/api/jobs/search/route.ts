import { NextRequest, NextResponse } from 'next/server';
import { UnifiedJobItem } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get('q') || '').trim();
  const skills = (searchParams.get('skills') || '').trim();
  const company = (searchParams.get('company') || '').trim();
  const location = (searchParams.get('location') || '').trim();
  const country = (searchParams.get('country') || 'us').toLowerCase();
  const workMode = (searchParams.get('workMode') || '').trim();
  const employmentType = (searchParams.get('employmentType') || '').trim();
  const minSalary = Number(searchParams.get('minSalary') || 0) || undefined;
  const page = Math.max(1, Number(searchParams.get('page') || 1) || 1);

  const adzunaAppId = process.env.ADZUNA_APP_ID?.trim() || '';
  const adzunaAppKey = process.env.ADZUNA_APP_KEY?.trim() || '';
  const joobleApiKey = process.env.JOOBLE_API_KEY?.trim() || '';

  const hasAdzuna = Boolean(adzunaAppId && adzunaAppKey);
  const hasJooble = Boolean(joobleApiKey);
  const hasExternalApi = hasAdzuna || hasJooble;

  if (!hasExternalApi) {
    return NextResponse.json({
      configuredProviders: { adzuna: false, jooble: false },
      hasExternalApi: false,
      jobs: [],
      totalResults: 0,
      page,
    });
  }

  const combinedKeywords = [query, skills, company, workMode === 'Remote' ? 'remote' : '']
    .filter(Boolean)
    .join(' ')
    .trim() || 'software engineer';

  const jobs: UnifiedJobItem[] = [];
  let totalResults = 0;
  const providerErrors: string[] = [];

  if (hasAdzuna) {
    try {
      const adzunaUrl = new URL(
        `https://api.adzuna.com/v1/api/jobs/${encodeURIComponent(country)}/search/${page}`
      );
      adzunaUrl.searchParams.set('app_id', adzunaAppId);
      adzunaUrl.searchParams.set('app_key', adzunaAppKey);
      adzunaUrl.searchParams.set('results_per_page', '12');
      adzunaUrl.searchParams.set('what', combinedKeywords);
      if (location) adzunaUrl.searchParams.set('where', location);
      if (minSalary) adzunaUrl.searchParams.set('salary_min', String(minSalary));
      if (employmentType === 'Full-time') adzunaUrl.searchParams.set('full_time', '1');
      if (employmentType === 'Part-time') adzunaUrl.searchParams.set('part_time', '1');
      if (employmentType === 'Contract') adzunaUrl.searchParams.set('contract', '1');

      const res = await fetch(adzunaUrl.toString(), {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        providerErrors.push(`Adzuna API returned HTTP ${res.status}`);
      } else {
        const data = await res.json();
        totalResults += Number(data.count || 0);
        const results = Array.isArray(data.results) ? data.results : [];
        for (const item of results) {
          const salMin = item.salary_min ? Math.round(item.salary_min) : null;
          const salMax = item.salary_max ? Math.round(item.salary_max) : null;
          const salaryText =
            salMin && salMax
              ? `$${salMin.toLocaleString()} – $${salMax.toLocaleString()}`
              : salMin
              ? `From $${salMin.toLocaleString()}`
              : undefined;

          jobs.push({
            jobKey: `adzuna-${item.id}`,
            title: String(item.title || 'Untitled Position').replace(/<\/?[^>]+(>|$)/g, ''),
            company: String(item.company?.display_name || 'Company listed on Adzuna'),
            location: String(item.location?.display_name || location || country.toUpperCase()),
            country: country.toUpperCase(),
            employmentType: item.contract_time ? String(item.contract_time) : employmentType || undefined,
            salary: salaryText,
            requiredSkills: skills
              ? skills
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
            description: String(item.description || '').replace(/<\/?[^>]+(>|$)/g, ''),
            postedAt: item.created ? String(item.created).slice(0, 10) : undefined,
            source: 'Adzuna',
            applyUrl: String(item.redirect_url || ''),
          });
        }
      }
    } catch (err) {
      providerErrors.push(
        `Adzuna request failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  if (hasJooble) {
    try {
      const joobleRes = await fetch(`https://jooble.org/api/${encodeURIComponent(joobleApiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: combinedKeywords,
          location: location || '',
          salary: minSalary ? String(minSalary) : undefined,
          page: String(page),
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!joobleRes.ok) {
        providerErrors.push(`Jooble API returned HTTP ${joobleRes.status}`);
      } else {
        const jData = await joobleRes.json();
        totalResults += Number(jData.totalCount || 0);
        const jJobs = Array.isArray(jData.jobs) ? jData.jobs : [];
        for (const item of jJobs.slice(0, 12)) {
          jobs.push({
            jobKey: `jooble-${item.id || encodeURIComponent(item.link || item.title)}`,
            title: String(item.title || 'Untitled Position'),
            company: String(item.company || 'Employer via Jooble'),
            location: String(item.location || location || 'Not specified'),
            employmentType: item.type ? String(item.type) : undefined,
            salary: item.salary ? String(item.salary) : undefined,
            requiredSkills: [],
            description: String(item.snippet || '').replace(/<\/?[^>]+(>|$)/g, ''),
            postedAt: item.updated ? String(item.updated).slice(0, 10) : undefined,
            source: item.source ? `Jooble (${item.source})` : 'Jooble',
            applyUrl: String(item.link || ''),
          });
        }
      }
    } catch (err) {
      providerErrors.push(
        `Jooble request failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  }

  return NextResponse.json({
    configuredProviders: { adzuna: hasAdzuna, jooble: hasJooble },
    hasExternalApi: true,
    jobs,
    totalResults,
    page,
    providerErrors,
  });
}
