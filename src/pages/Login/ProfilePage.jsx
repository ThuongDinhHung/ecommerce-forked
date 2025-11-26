import React, { useEffect, useState } from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import getCurrentUser from '../../services/userService';

const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp&s=120';

function formatDate(d) {
	if (!d) return '';
	try {
		const date = typeof d === 'string' ? new Date(d) : d;
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	} catch {
		return String(d);
	}
}

export default function ProfilePage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [user, setUser] = useState(null);
	const [role, setRole] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
	const [shipper, setShipper] = useState(null);

	useEffect(() => {
		let mounted = true;
		const fetchUser = async () => {
			try {
				setLoading(true);
				const data = await getCurrentUser();
				if (!mounted) return;
				if (!data) {
					setError('Failed to load profile');
					setLoading(false);
					return;
				}

				const u = data?.user || data?.data?.user || data?.data || data;
				const r = (data.userRole).toString();
				setUser(u || null);
				setRole(r);
                setPhoneNumber(data.phoneNumber);
			} catch (e) {
				if (mounted) setError(e.message || 'Failed to load profile');
			} finally {
				if (mounted) setLoading(false);
			}
		};
		fetchUser();
		return () => { mounted = false; };
	}, []);

    console.log('ProfilePage: Current user:', user);

	// Optionally fetch shipper details if user is a shipper
	useEffect(() => {
		let mounted = true;
		const lower = (role || '').toLowerCase();
		if (!lower.includes('shipper')) return;
		(async () => {
			try {
				const res = await fetch('/api/shipper/me', { credentials: 'include' });
				const data = await res.json().catch(() => ({}));
				if (!mounted) return;
				if (res.ok && data?.success) {
					setShipper(data.data?.shipperDetails || null);
				}
			} catch {
				// ignore optional fetch errors
			}
		})();
		return () => { mounted = false; };
	}, [role]);

	const label = 'text-sm font-medium text-slate-600';
	const value = 'text-slate-900';

	return (
		<div className="min-h-screen bg-gray-50">
			<Header />

			<main className="max-w-5xl mx-auto p-6">
				<h1 className="text-3xl font-bold text-slate-900 mb-6">My Profile</h1>

				{loading && (
					<div className="bg-white rounded-lg shadow p-6">Loading profile…</div>
				)}

				{!loading && error && (
					<div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
						{error}
					</div>
				)}

				{!loading && !error && user && (
					<div className="space-y-6">
						{/* Header card */}
						<section className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
							<img
								src={user?.avatar || DEFAULT_AVATAR}
								alt="avatar"
								className="w-20 h-20 rounded-full border"
							/>
							<div>
								<p className="text-xl font-semibold text-slate-900">{user?.Username || user?.username || 'User'}</p>
								<p className="text-slate-600">{user?.Email || user?.email}</p>
								{role && <p className="text-slate-500">Role: {role}</p>}
							</div>
						</section>

						{/* Account details */}
						<section className="bg-white rounded-lg shadow p-6">
							<h2 className="text-lg font-semibold text-slate-900 mb-4">Account</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<div className={label}>Username</div>
									<div className={value}>{user?.Username || user?.username || '-'}</div>
								</div>
								<div>
									<div className={label}>Email</div>
									<div className={value}>{user?.Email || user?.email || '-'}</div>
								</div>
								<div>
									<div className={label}>Role</div>
									<div className={value}>{role || '-'}</div>
								</div>
							</div>
						</section>

						{/* Personal details */}
						<section className="bg-white rounded-lg shadow p-6">
							<h2 className="text-lg font-semibold text-slate-900 mb-4">Personal</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<div className={label}>Age</div>
									<div className={value}>{user?.Age ?? user?.age ?? '-'}</div>
								</div>
								<div>
									<div className={label}>Date of Birth</div>
									<div className={value}>{formatDate(user.DateOfBirth)}</div>
								</div>
								<div>
									<div className={label}>Gender</div>
									<div className={value}>{user?.Gender || user?.gender || '-'}</div>
								</div>
								<div>
									<div className={label}>Phone</div>
									<div className={value}>{phoneNumber}</div>
								</div>
								<div className="md:col-span-2">
									<div className={label}>Address</div>
									<div className={value}>{user?.Address || user?.address || '-'}</div>
								</div>
							</div>
						</section>

						{/* Shipper details (optional) */}
						{shipper && (
							<section className="bg-white rounded-lg shadow p-6">
								<h2 className="text-lg font-semibold text-slate-900 mb-4">Shipper</h2>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<div className={label}>Company</div>
										<div className={value}>{shipper.Company || '-'}</div>
									</div>
									<div>
										<div className={label}>License</div>
										<div className={value}>{shipper.License || '-'}</div>
									</div>
								</div>
							</section>
						)}
					</div>
				)}
			</main>

			<Footer />
		</div>
	);
}

