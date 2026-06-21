export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Format email tidak valid. Pastikan penulisan email sudah benar.';
    case 'auth/invalid-credential':
      return 'Email atau password yang Anda masukkan salah.';
    case 'auth/user-disabled':
      return 'Akun ini telah diblokir atau dinonaktifkan oleh Admin.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Silakan coba lagi nanti.';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah. Periksa jaringan Anda.';
    default:
      return 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.';
  }
}