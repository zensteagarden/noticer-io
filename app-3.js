      function receiptsView() {
        return `<section class="page" aria-labelledby="receipts-title">
          <div class="page-head">
            <div>
              <p class="eyebrow" style="margin-bottom:14px">Closure records</p>
              <h1 id="receipts-title">Receipts</h1>
              <p class="page-copy">Receipts record what the evidence supported, when it was supported, and what the relying party was allowed to do because of it.</p>
            </div>
          </div>
          <div class="receipt-list">
            <a class="receipt-row" href="#/receipt/live">
              <span><span class="receipt-title">Stripe → Access · Paid access became active</span><span class="receipt-sub">Fresh real payment · independent observation + control · keyless relying party</span></span>
              <span class="receipt-meta">${escapeHtml(formatDate(LIVE_PROOF.completedAt))}</span>
              <span class="status saved"><span class="status-dot" aria-hidden="true"></span>Saved proof</span>
              <span class="row-arrow" aria-hidden="true">›</span>
            </a>
          </div>
          <p class="input-note" style="margin-top:16px">Trackable ideas saved in this browser do not receive a receipt until a real verification path exists. Noticer does not manufacture demo receipts.</p>
        </section>`;
      }

      function receiptView() {
        return `<section class="page" aria-labelledby="receipt-title">
          <div class="page-head">
            <div>
              <p class="eyebrow" style="margin-bottom:14px">Verification receipt</p>
              <h1 id="receipt-title">PROVED</h1>
              <p class="page-copy">Evidence established the required outcome for the identified live run.</p>
            </div>
            <span class="status saved"><span class="status-dot" aria-hidden="true"></span>Saved proof</span>
          </div>
          <article class="detail-card" style="max-width:850px">
            <div class="detail-section">
              <dl class="facts">
                ${fact('Human state', 'Established at the recorded time')}
                ${fact('Required outcome', 'Paid access became active for the identified payment consequence')}
                ${fact('Payment anchor', LIVE_PROOF.payment)}
                ${fact('Stripe event', LIVE_PROOF.stripeEvent)}
                ${fact('Receipt verification A', LIVE_PROOF.verification1)}
                ${fact('Receipt verification B', LIVE_PROOF.verification2)}
                ${fact('Questioned observation', 'ACCESS entitlement present')}
                ${fact('Control observation', 'Healthy')}
                ${fact('Hostile matrix', LIVE_PROOF.matrix)}
                ${fact('Protected writes', String(LIVE_PROOF.protectedWrites))}
                ${fact('Relying party signer', 'Absent')}
                ${fact('Relying party source mutation', 'Unavailable')}
                ${fact('Completed', formatDate(LIVE_PROOF.completedAt))}
              </dl>
            </div>
            <div class="detail-section">
              <h3>Evidence boundary</h3>
              <p>This receipt establishes the outcome for the completed verification run above. It does not claim that the state remains current after the freshness window, and it does not grant the claimant authority to write its own verdict.</p>
            </div>
          </article>
        </section>`;
      }

      function fact(label, value) { return `<div class="fact"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`; }

      function feedbackView() {
        const f = loadState().feedback || {};
        return `<section class="page feedback-wrap" aria-labelledby="feedback-title">
          <div class="page-head">
            <div>
              <p class="eyebrow" style="margin-bottom:14px">Private beta</p>
              <h1 id="feedback-title">Tell John what happened.</h1>
              <p class="page-copy">There is no survey backend in this preview. Your answers stay in this browser until you copy and send them.</p>
            </div>
          </div>
          <form class="feedback-form" id="feedback-form">
            ${feedbackField('understand', '1. What do you think Noticer does?', 'Use your own words.', f.understand)}
            ${feedbackField('want', '2. What would you want Noticer to keep track of for you?', 'Name real things from your life or work.', f.want)}
            ${feedbackField('confusing', '3. What was confusing?', 'Anything you had to guess at.', f.confusing)}
            ${feedbackField('trust', '4. Was there anything you did not trust?', 'Anything that felt fake, unclear, or too convenient.', f.trust)}
            <div class="feedback-actions">
              <button class="button" type="submit">Copy feedback for John</button>
              <span class="feedback-status" id="feedback-status" role="status"></span>
            </div>
          </form>
        </section>`;
      }

      function feedbackField(name, label, hint, value='') {
        return `<div class="field"><label for="fb-${name}">${escapeHtml(label)}</label><p class="hint">${escapeHtml(hint)}</p><textarea id="fb-${name}" name="${name}" maxlength="1200">${escapeHtml(value)}</textarea></div>`;
      }

      function notFoundView() {
        return `<section class="page"><h1>Not found.</h1><p class="page-copy">That Noticer view does not exist.</p><p><a class="button secondary" href="#/">Return home</a></p></section>`;
      }
