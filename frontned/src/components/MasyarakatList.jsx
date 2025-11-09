import useFetch from "../hooks/useFetch";

export default function MasyarakatList() {
  const { data: masyarakat, loading, error } = useFetch("/masyarakat");

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message || error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Daftar Masyarakat</h2>
      <table className="w-full border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">NIK</th>
            <th className="p-2">Nama</th>
            <th className="p-2">Email</th>
            <th className="p-2">Telp</th>
            <th className="p-2">Alamat</th>
          </tr>
        </thead>
        <tbody>
          {masyarakat?.map((user) => (
            <tr key={user.nik} className="border-t">
              <td className="p-2">{user.nik}</td>
              <td className="p-2">{user.nama}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.telp}</td>
              <td className="p-2">{user.alamat}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
