function houseView() {
  const state = loadState();
  const view = state.ledgerView || 'important';
  const ideas = [...state.ideas].sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  return `<section class="page" aria-labelledby="house-title">
    <div class="page-head">
      <div>
        <p class="eyebrow" style="margin-bottom:14px">Glass House</p>
        <h1 id="house-title">Trackables</h1>
        <p class="page-copy">One place to track what’s true, what’s unresolved, and exactly where proof stopped.</p>
      </div>
      <a class="button secondary" href="#/">Add something to notice</a>
    </div>
    <div class="ledger-shell">
      <div class="ledger-toolbar">
        <div class="segmented" role="group" aria-label="Sort Trackables">
          <button type="button" data-ledger-view="important" aria-pressed="${view === 'important'}">Important</button>
          <button type="button" data-ledger-view="accounts" aria-pressed="${view === 'accounts'}">Accounts</button>
          <button type="button" data-ledger-view="all" aria-pressed="${view === 'all'}">All</button>
        </div>
        <span class="mono" style="color:var(--muted)">${ideas.length + 1} trackable${ideas.length === 0 ? '' : 's'}</span>
      </div>
      ${ideas.length ? `
        <section class="account" aria-labelledby="beta-ideas-account">
          <div class="account-head">
            <div class="account-name"><span class="account-mark" aria-hidden="true">N</span><span id="beta-ideas-account">Your beta ideas</span></div>
            <span class="account-meta">Not connected</span>
          </div>
          ${ideas.map(idea => trackableRow({ id: idea.id, title: idea.title, subtitle: idea.sourceText, status: 'SETUP NEEDED', statusClass: 'setup' })).join('')}
        </section>` : ''}
      <section class="account" aria-labelledby="proof-account">
        <div class="account-head">
          <div class="account-name"><span class="account-mark" aria-hidden="true">S</span><span id="proof-account">Stripe → Access</span></div>
          <span class="account-meta">Not your account · canonical live proof</span>
        </div>
        ${trackableRow({ id: LIVE_PROOF.id, title: LIVE_PROOF.title, subtitle: 'Established in a fresh live run, then preserved as historical proof.', status: LIVE_PROOF.status, statusClass: LIVE_PROOF.statusClass, proof: true })}
      </section>
    </div>
    <p class="input-note" style="margin-top:16px">A saved proof records what was established at a specific time. It is not presented as a current-state assertion after its freshness window expires.</p>
  </section>`;
}

function trackableRow(item) {
  return `<a class="trackable-row" href="#/trackable/${encodeURIComponent(item.id)}">
    <span class="track-rail ${item.statusClass}" aria-hidden="true"></span>
    <span class="track-main"><span class="track-title">${escapeHtml(item.title)}</span><span class="track-sub">${escapeHtml(item.subtitle)}</span></span>
    <span class="track-status"><span class="status ${item.statusClass}"><span class="status-dot" aria-hidden="true"></span>${escapeHtml(item.status)}</span></span>
    <span class="row-arrow" aria-hidden="true">›</span>
  </a>`;
}

function userTrackableView(id) {
  const state = loadState();
  const idea = state.ideas.find(x => x.id === id);
  if (!idea) return notFoundView();
  return `<section class="page" aria-labelledby="trackable-title">
    <div class="page-head">
      <div>
        <p class="eyebrow" style="margin-bottom:14px">Trackable candidate</p>
        <h1 id="trackable-title">${escapeHtml(idea.title)}</h1>
        <p class="page-copy">Noticer can describe the proof obligation before asking you to connect anything.</p>
      </div>
      <span class="status setup"><span class="status-dot" aria-hidden="true"></span>Setup needed</span>
    </div>
    <div class="detail-grid">
      <article class="detail-card">
        <div class="detail-section">
          <p class="mono" style="color:var(--muted)">What you told Noticer</p>
          <h2>“${escapeHtml(idea.sourceText)}”</h2>
        </div>
        <div class="detail-section">
          <h3>What would have to be true</h3>
          <p>${escapeHtml(idea.title)}</p>
        </div>
        <div class="detail-section">
          <h3>Five-operator proof obligation</h3>
          <ol class="operator-list">
            ${operatorItem(1, 'Claim', idea.claim)}
            ${operatorItem(2, 'Required outcome', idea.title)}
            ${operatorItem(3, 'Questioned observation', idea.observation)}
            ${operatorItem(4, 'Control observation', idea.control)}
            ${operatorItem(5, 'Verdict / receipt', 'Not authored by the claimant. Issued only after the evidence and control are evaluated.')}
          </ol>
        </div>
      </article>
      <aside>
        <div class="side-note">
          <h3>Why Noticer has not asked for access yet</h3>
          <p>This candidate has not entered verification. Connections are requested only after the product can explain what each connection would prove.</p>
        </div>
        <div class="side-note" style="margin-top:14px">
          <h3>Likely systems</h3>
          <p>${idea.systems.map(escapeHtml).join(' · ')}</p>
        </div>
        <div style="margin-top:18px;display:grid;gap:10px">
          <button class="button" type="button" data-copy-request="${escapeHtml(idea.id)}">Copy beta setup request</button>
          <button class="button ghost" type="button" data-remove-idea="${escapeHtml(idea.id)}">Remove from Glass House</button>
        </div>
      </aside>
    </div>
  </section>`;
}

function operatorItem(n, name, body) {
  return `<li class="operator"><span class="operator-num">0${n}</span><span><strong>${escapeHtml(name)}</strong><span>${escapeHtml(body)}</span></span></li>`;
}

function liveProofView() {
  const stages = [
    'Job created','Worker claimed','Questioned source read','Control source read','Predicate evaluated','Verdict created','Signed receipt','Relying party verifies','Gate authorizes','Protected write'
  ];
  return `<section class="page" aria-labelledby="proof-title">
    <div class="page-head">
      <div>
        <p class="eyebrow" style="margin-bottom:14px">Real live proof · saved record</p>
        <h1 id="proof-title">Paid access became active.</h1>
        <p class="page-copy">A fresh $1 Stripe payment triggered autonomous provisioning. Noticer independently observed the resulting access state and a healthy control, issued signed receipts, and a separate keyless gate allowed exactly one protected write.</p>
      </div>
      <span class="status saved"><span class="status-dot" aria-hidden="true"></span>Saved proof</span>
    </div>
    <div class="detail-grid">
      <article class="detail-card">
        <div class="detail-section">
          <p class="mono" style="color:var(--muted)">Established at ${escapeHtml(formatDate(LIVE_PROOF.completedAt))}</p>
          <h2>FRESH LIVE PAYMENT → AUTONOMOUS PROVISION → INDEPENDENT RECEIPT → KEYLESS GATE</h2>
          <p>This is historical proof of that completed run. Its freshness window has expired, so this page does not claim the access state is still current.</p>
        </div>
        <div class="detail-section">
          <h3>Five operators</h3>
          <ol class="operator-list">
            ${operatorItem(1, 'Claim', 'A fresh live Stripe payment succeeded.')}
            ${operatorItem(2, 'Required outcome', 'The identified paid customer had active access.')}
            ${operatorItem(3, 'Questioned observation', 'The verifier independently read the customer entitlement state.')}
            ${operatorItem(4, 'Control observation', 'The verifier independently read a nearby healthy control path.')}
            ${operatorItem(5, 'Verdict / receipt', 'PROVED. Signed by Noticer, not by Stripe and not by the relying party.')}
          </ol>
        </div>
        <div class="detail-section">
          <h3>Proof chain</h3>
          <ol class="stage-list">
            ${stages.map((name,i) => `<li class="stage"><span class="stage-num">${String(i+1).padStart(2,'0')}</span><span class="stage-name">${escapeHtml(name)}</span><span class="stage-pass">PASS</span></li>`).join('')}
          </ol>
        </div>
      </article>
      <aside>
        <div class="side-note">
          <h3>Hostile acceptance</h3>
          <p><strong>${LIVE_PROOF.matrix}</strong>. Forged, stale, wrong-subject and wrong-obligation receipts were blocked. Verifier outage held. Replay was blocked.</p>
        </div>
        <div class="side-note" style="margin-top:14px">
          <h3>Authority separation</h3>
          <p>Relying party signing material: <strong>absent</strong>.<br>Relying party source-mutation authority: <strong>absent</strong>.<br>Mutation probe: <strong>${escapeHtml(LIVE_PROOF.sourceMutationProbe)}</strong>.</p>
        </div>
        <div class="side-note" style="margin-top:14px">
          <h3>Exactly one consequence</h3>
          <p>Protected write count: <strong>${LIVE_PROOF.protectedWrites}</strong>. A replay and a second valid receipt for the same consequence did not create a second write.</p>
        </div>
        <a class="button" style="margin-top:18px;width:100%" href="#/receipt/live">Open receipt record</a>
      </aside>
    </div>
  </section>`;
}
