// Fungsi untuk memutar suara
export function playSound(filename) {
    const audio = new Audio(`../sound/${filename}`);
    audio.play();
} 