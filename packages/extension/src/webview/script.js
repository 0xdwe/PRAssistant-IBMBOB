// @ts-check
(function () {
  const vscode = acquireVsCodeApi();
  let currentPacket = null;

  // Listen for messages from the extension
  window.addEventListener('message', (event) => {
    const message = event.data;
    switch (message.type) {
      case 'update':
        currentPacket = message.packet;
        renderPacket(message.packet);
        break;
      case 'error':
        showError(message.error);
        break;
    }
  });

  function renderPacket(packet) {
    // Hide states, show content
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('content').style.display = 'block';

    // Render Summary
    renderSummary(packet.summary);

    // Render Metadata
    renderMetadata(packet.metadata);

    // Render Files Changed
    renderFiles(packet.filesChanged);

    // Render Test Status
    renderTests(packet.testStatus, packet.testResults);

    // Render Risks
    renderRisks(packet.risks);

    // Render Checklist
    renderChecklist(packet.checklist);
  }

  function renderSummary(summary) {
    const content = document.getElementById('summary-content');
    content.innerHTML = `<p>${escapeHtml(summary)}</p>`;
  }

  function renderMetadata(metadata) {
    const content = document.getElementById('metadata-content');
    content.innerHTML = `
      <div class="metadata-item">
        <span class="metadata-label">Base Branch:</span>
        <span class="metadata-value">${escapeHtml(metadata.baseBranch)}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Head Branch:</span>
        <span class="metadata-value">${escapeHtml(metadata.headBranch)}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Total Files:</span>
        <span class="metadata-value">${metadata.totalFiles}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Total Changes:</span>
        <span class="metadata-value">${metadata.totalChanges}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Generated:</span>
        <span class="metadata-value">${escapeHtml(metadata.generatedAt)}</span>
      </div>
    `;
  }

  function renderFiles(filesChanged) {
    const content = document.getElementById('files-content');
    if (!filesChanged || filesChanged.length === 0) {
      content.innerHTML = '<div class="empty-section">No files changed</div>';
      return;
    }

    let html = '';
    for (const category of filesChanged) {
      html += `
        <div class="file-category">
          <div class="category-title">${escapeHtml(category.name)} (${category.count})</div>
          <ul class="file-list">
            ${category.files.map(file => `<li>${escapeHtml(file)}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    content.innerHTML = html;
  }

  function renderTests(testStatus, testResults) {
    const content = document.getElementById('tests-content');
    let html = '<div class="test-status">';

    html += `
      <div class="status-item">
        <span class="status-icon">${testStatus.hasTests ? '✅' : '❌'}</span>
        <span class="status-label">Has Tests:</span>
        <span class="status-value">${testStatus.hasTests ? 'Yes' : 'No'}</span>
      </div>
      <div class="status-item">
        <span class="status-icon">${testStatus.sourceFilesChanged ? '📝' : '📄'}</span>
        <span class="status-label">Source Files Changed:</span>
        <span class="status-value">${testStatus.sourceFilesChanged ? 'Yes' : 'No'}</span>
      </div>
      <div class="status-item">
        <span class="status-icon">${testStatus.missingTests ? '⚠️' : '✅'}</span>
        <span class="status-label">Missing Tests:</span>
        <span class="status-value">${testStatus.missingTests ? 'Yes' : 'No'}</span>
      </div>
    `;

    if (testStatus.testFiles && testStatus.testFiles.length > 0) {
      html += `
        <div style="margin-top: 12px;">
          <div class="status-label" style="margin-bottom: 8px;">Test Files:</div>
          <ul class="file-list">
            ${testStatus.testFiles.map(file => `<li>${escapeHtml(file)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (testResults) {
      html += `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vscode-panel-border);">
          <div class="status-label" style="margin-bottom: 8px;">Test Results:</div>
          <div class="status-item">
            <span class="status-icon">${testResults.passed ? '✅' : '❌'}</span>
            <span class="status-label">Status:</span>
            <span class="status-value">${testResults.passed ? 'Passed' : 'Failed'}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Total:</span>
            <span class="status-value">${testResults.totalTests}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Passed:</span>
            <span class="status-value">${testResults.passedTests}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Failed:</span>
            <span class="status-value">${testResults.failedTests}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Duration:</span>
            <span class="status-value">${(testResults.duration / 1000).toFixed(2)}s</span>
          </div>
        </div>
      `;
    }

    html += '</div>';
    content.innerHTML = html;
  }

  function renderRisks(risks) {
    const content = document.getElementById('risks-content');
    if (!risks || risks.length === 0) {
      content.innerHTML = '<div class="empty-section">No risk flags detected</div>';
      return;
    }

    let html = '';
    for (const risk of risks) {
      html += `
        <div class="risk-item ${risk.level}">
          <div class="risk-title">${risk.level.toUpperCase()}: ${escapeHtml(risk.file)}</div>
          <div class="risk-detail">
            <span class="risk-label">Reason:</span> ${escapeHtml(risk.reason)}
          </div>
          <div class="risk-detail">
            <span class="risk-label">Pattern:</span> <code>${escapeHtml(risk.pattern)}</code>
          </div>
        </div>
      `;
    }
    content.innerHTML = html;
  }

  function renderChecklist(checklist) {
    const content = document.getElementById('checklist-content');
    if (!checklist || checklist.length === 0) {
      content.innerHTML = '<div class="empty-section">No checklist items</div>';
      return;
    }

    let html = '<ul class="checklist">';
    for (const item of checklist) {
      html += `<li>${escapeHtml(item)}</li>`;
    }
    html += '</ul>';
    content.innerHTML = html;
  }

  function showError(error) {
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('content').style.display = 'none';
    document.getElementById('error-state').style.display = 'flex';
    document.getElementById('error-message').textContent = error;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Global functions for button clicks
  window.runAnalysis = function () {
    vscode.postMessage({ type: 'runAnalysis' });
  };

  window.copySection = function (section) {
    if (!currentPacket) return;

    let content = '';
    switch (section) {
      case 'summary':
        content = formatSummary(currentPacket);
        break;
      case 'files':
        content = formatFiles(currentPacket);
        break;
      case 'tests':
        content = formatTests(currentPacket);
        break;
      case 'risks':
        content = formatRisks(currentPacket);
        break;
      case 'checklist':
        content = formatChecklist(currentPacket);
        break;
    }

    vscode.postMessage({ type: 'copy', content });
  };

  window.copyAll = function () {
    if (!currentPacket) return;

    const content = `# PR Analysis

${formatSummary(currentPacket)}

${formatMetadata(currentPacket)}

${formatFiles(currentPacket)}

${formatTests(currentPacket)}

${formatRisks(currentPacket)}

${formatChecklist(currentPacket)}`;

    vscode.postMessage({ type: 'copy', content });
  };

  function formatSummary(packet) {
    return `## Summary\n\n${packet.summary}`;
  }

  function formatMetadata(packet) {
    const m = packet.metadata;
    return `## Metadata

- **Base Branch**: ${m.baseBranch}
- **Head Branch**: ${m.headBranch}
- **Total Files**: ${m.totalFiles}
- **Total Changes**: ${m.totalChanges}
- **Generated**: ${m.generatedAt}`;
  }

  function formatFiles(packet) {
    let text = '## Files Changed\n';
    for (const category of packet.filesChanged) {
      text += `\n### ${category.name} (${category.count})\n\n`;
      for (const file of category.files) {
        text += `- ${file}\n`;
      }
    }
    return text;
  }

  function formatTests(packet) {
    const t = packet.testStatus;
    let text = `## Test Status

- **Has Tests**: ${t.hasTests ? 'Yes' : 'No'}
- **Source Files Changed**: ${t.sourceFilesChanged ? 'Yes' : 'No'}
- **Missing Tests**: ${t.missingTests ? 'Yes' : 'No'}`;

    if (t.testFiles && t.testFiles.length > 0) {
      text += '\n\n**Test Files**:\n';
      for (const file of t.testFiles) {
        text += `- ${file}\n`;
      }
    }

    if (packet.testResults) {
      const r = packet.testResults;
      text += `\n\n**Test Results**:
- Status: ${r.passed ? 'Passed' : 'Failed'}
- Total: ${r.totalTests}
- Passed: ${r.passedTests}
- Failed: ${r.failedTests}
- Duration: ${(r.duration / 1000).toFixed(2)}s`;
    }

    return text;
  }

  function formatRisks(packet) {
    if (!packet.risks || packet.risks.length === 0) {
      return '## Risk Flags\n\nNo risk flags detected';
    }

    let text = '## Risk Flags\n';
    for (const risk of packet.risks) {
      text += `\n### ${risk.level.toUpperCase()}: ${risk.file}\n\n`;
      text += `- **Reason**: ${risk.reason}\n`;
      text += `- **Pattern**: ${risk.pattern}\n`;
    }
    return text;
  }

  function formatChecklist(packet) {
    let text = '## Reviewer Checklist\n\n';
    for (const item of packet.checklist) {
      text += `- [ ] ${item}\n`;
    }
    return text;
  }
})();

// Made with Bob
