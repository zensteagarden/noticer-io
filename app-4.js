      function attachHome() {
        const form = document.getElementById('notice-form');
        if (!form) return;
        const input = document.getElementById('notice-input');
        let lastCandidates = [];
        form.addEventListener('submit', e => {
          e.preventDefault();
          const text = input.value.trim();
          if (!text) { input.focus(); announce('Tell Noticer something that matters first.'); return; }
          const state = loadState();
          state.lastInput = text;
          saveState(state);
          lastCandidates = discover(text);
          const slot = document.getElementById('discovery-slot');
          slot.innerHTML = discoveryView(text, lastCandidates);
          bindCandidateButtons(text, lastCandidates);
          slot.querySelector('h2')?.focus?.();
          announce('Noticer found three candidate Trackables.');
        });
      }

      function bindCandidateButtons(sourceText, candidates) {
        document.querySelectorAll('[data-save-candidate]').forEach(btn => {
          btn.addEventListener('click', () => {
            const c = candidates[Number(btn.dataset.saveCandidate)];
            if (!c) return;
            const state = loadState();
            const existing = state.ideas.find(x => x.title === c.title && x.sourceText === sourceText);
            if (existing) { toast('Already in your Glass House.'); return; }
            const idea = { id: slug(), createdAt: new Date().toISOString(), sourceText, ...c };
            state.ideas.push(idea);
            saveState(state);
            btn.textContent = 'Kept';
            btn.disabled = true;
            toast('Added to your Glass House as SETUP NEEDED.');
            announce('Candidate Trackable added to your Glass House. No connection was made.');
          });
        });
      }

      function attachHouse() {
        document.querySelectorAll('[data-ledger-view]').forEach(btn => btn.addEventListener('click', () => {
          const state = loadState();
          state.ledgerView = btn.dataset.ledgerView;
          saveState(state);
          render(false);
        }));
      }

      function attachTrackable() {
        document.querySelector('[data-copy-request]')?.addEventListener('click', async e => {
          const state = loadState();
          const idea = state.ideas.find(x => x.id === e.currentTarget.dataset.copyRequest);
          if (!idea) return;
          const text = `NOTICER BETA SETUP REQUEST\n\nWhat I want to keep track of:\n${idea.title}\n\nWhat I told Noticer:\n${idea.sourceText}\n\nClaim:\n${idea.claim}\n\nQuestioned observation needed:\n${idea.observation}\n\nControl observation needed:\n${idea.control}\n\nLikely systems:\n${idea.systems.join(' + ')}`;
          await copyText(text);
          toast('Beta setup request copied.');
        });
        document.querySelector('[data-remove-idea]')?.addEventListener('click', e => {
          const id = e.currentTarget.dataset.removeIdea;
          const state = loadState();
          state.ideas = state.ideas.filter(x => x.id !== id);
          saveState(state);
          go('/house');
          toast('Removed from your Glass House.');
        });
      }

      function attachFeedback() {
        const form = document.getElementById('feedback-form');
        if (!form) return;
        const save = () => {
          const state = loadState();
          state.feedback = Object.fromEntries(new FormData(form).entries());
          saveState(state);
        };
        form.addEventListener('input', save);
        form.addEventListener('submit', async e => {
          e.preventDefault(); save();
          const f = loadState().feedback;
          const text = `NOTICER PRIVATE BETA FEEDBACK\n\n1. What I think Noticer does:\n${f.understand || ''}\n\n2. What I would want Noticer to keep track of:\n${f.want || ''}\n\n3. What was confusing:\n${f.confusing || ''}\n\n4. What I did not trust:\n${f.trust || ''}`;
          const ok = await copyText(text);
          const status = document.getElementById('feedback-status');
          status.textContent = ok ? 'Copied. Send this message back to John.' : 'Copy was blocked. Select the answers and send them to John.';
          announce(status.textContent);
        });
      }

      async function copyText(text) {
        try { await navigator.clipboard.writeText(text); return true; }
        catch (_) {
          const ta = document.createElement('textarea');
          ta.value = text; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0';
          document.body.appendChild(ta); ta.select();
          const ok = document.execCommand('copy'); ta.remove(); return ok;
        }
      }

      function render(focusMain = true) {
        const path = route();
        setCurrentNav(path);
        let html;
        if (path === '/') html = homeView();
        else if (path === '/house') html = houseView();
        else if (path === '/receipts') html = receiptsView();
        else if (path === '/proof/live') html = liveProofView();
        else if (path === '/receipt/live') html = receiptView();
        else if (path === '/feedback') html = feedbackView();
        else if (path.startsWith('/trackable/')) {
          const id = decodeURIComponent(path.slice('/trackable/'.length));
          html = id === LIVE_PROOF.id ? liveProofView() : userTrackableView(id);
        } else html = notFoundView();
        const main = document.getElementById('main');
        main.innerHTML = html;
        if (path === '/') attachHome();
        if (path === '/house') attachHouse();
        if (path.startsWith('/trackable/')) attachTrackable();
        if (path === '/feedback') attachFeedback();
        if (focusMain) main.focus({ preventScroll: true });
      }

      window.addEventListener('hashchange', () => render(true));
      render(false);
    })();
