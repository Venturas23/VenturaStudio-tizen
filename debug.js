function logDebug(message) {
    const debugDiv = document.getElementById('debugLog');
    if (debugDiv) {
        debugDiv.innerHTML += `<p>${message}</p>`;
        debugDiv.scrollTop = debugDiv.scrollHeight; // Mantém o scroll no final
    }
}
