
import Turf from '../../features/turf/turf.model.js';
import Slot from '../../features/turf/slot.model.js';
import User from '../../features/auth/auth.model.js';
import { sendError, sendSuccess } from '../../utils/errorHandler.js';
import Booking from '../../features/turf/booking.model.js';


const getDateRanges = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const next7Days = new Date(today);
  next7Days.setDate(today.getDate() + 7);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd   = new Date(today.getFullYear(), today.getMonth(), 1);

  return { today, tomorrow, next7Days, monthStart, lastMonthStart, lastMonthEnd };
};

const percentChange = (current, previous) => {
  if (!previous || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
};

export const getOwnerDashboardData = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { today, tomorrow, next7Days, monthStart, lastMonthStart, lastMonthEnd } = getDateRanges();

    const ownerTurfs = await Turf.find({ owner: ownerId }).lean();
    const turfIds = ownerTurfs.map(t => t.id);

    const turfs = ownerTurfs.map(t => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      coverImage: t.coverImage ?? null,
      images: t.images ?? [],
      status: t.status,
      isActive: t.isActive,
      pricePerSlot: t.pricePerSlot,
      sports: t.sports ?? [],
      city: t.location?.city ?? '',
      area: t.location?.area ?? '',
    }));

    const totalTurfs = ownerTurfs.length;
    const activeTurfs = ownerTurfs.filter(t => t.isActive && t.status === 'active').length;
    const pendingTurfs = ownerTurfs.filter(t => t.status === 'pending').length;

    if (turfIds.length === 0) {
      return sendSuccess(res, {
        role: 'owner',
        stats: {
          totalTurfs,
          activeTurfs,
          pendingTurfs,
          todayAvailableSlots: 0,
          todayBookedSlots: 0,
          todayTotalSlots: 0,
          upcomingBookedCount: 0,
          thisMonthRevenue: 0,
          lastMonthRevenue: 0,
          totalRevenue: 0,
          revenueTrend: null,
          thisMonthBookings: 0,
          lastMonthBookings: 0,
          bookedTrend: null,
          newBookingsToday: 0,
        },
        turfs,
        quickAvailableSlots: [],
        upcomingBookedSlots: [],
        newBookings: [],
      });
    }

    const [
      todayAvailableSlotsDocs,
      todayBookedCount,
      todayTotalCount,
      upcomingBookedSlotsDocs,
    ] = await Promise.all([
      Slot.find({
        turf: { $in: turfIds },
        date: today,
        status: 'available',
      })
        .sort({ startTime: 1 })
        .select('id startTime endTime price durationMinutes turf')
        .lean(),

      Slot.countDocuments({
        turf: { $in: turfIds },
        date: today,
        status: { $in: ['booked', 'completed'] },
      }),

      Slot.countDocuments({
        turf: { $in: turfIds },
        date: today,
      }),

      Slot.find({
        turf: { $in: turfIds },
        date: { $gte: tomorrow, $lte: next7Days },
        status: 'booked',
      })
        .sort({ date: 1, startTime: 1 })
        .limit(10)
        .lean(),
    ]);

    // Group ONLY today's available slots by turf (no limit now)
    const turfSlotMap = new Map();

    ownerTurfs.forEach(t => {
      turfSlotMap.set(t.id, {
        turfId: t.id,
        turfName: t.name,
        quickAvailableSlots: []
      });
    });

    todayAvailableSlotsDocs.forEach(slot => {
      const turfData = turfSlotMap.get(slot.turf);
      if (turfData) {
        turfData.quickAvailableSlots.push({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: slot.price,
          duration: `${slot.durationMinutes} mins`,
          status: 'available',
          isBooked: false,
        });
      }
    });

    const quickAvailableSlots = Array.from(turfSlotMap.values())
      .map(t => ({
        turfId: t.turfId,
        turfName: t.turfName,
        slots: t.quickAvailableSlots
      }));

    const upcomingBookedSlots = upcomingBookedSlotsDocs.map(s => ({
      id: s.id,
      date: s.date.toISOString().split('T')[0],
      startTime: s.startTime,
      endTime: s.endTime,
      slotTime: `${s.startTime} – ${s.endTime}`,
      price: s.price,
    }));

    const PAID_STATUSES = ['confirmed', 'completed'];

    const [
      thisMonthRevAgg,
      lastMonthRevAgg,
      totalRevAgg,
      thisMonthBookingCount,
      lastMonthBookingCount,
      newBookingsTodayCount,
      newBookingsDocs,
    ] = await Promise.all([
      Booking.aggregate([
        {
          $match: {
            turf: { $in: turfIds },
            status: { $in: PAID_STATUSES },
            createdAt: { $gte: monthStart },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      Booking.aggregate([
        {
          $match: {
            turf: { $in: turfIds },
            status: { $in: PAID_STATUSES },
            createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      Booking.aggregate([
        {
          $match: {
            turf: { $in: turfIds },
            status: { $in: PAID_STATUSES },
          },
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      Booking.countDocuments({
        turf: { $in: turfIds },
        status: { $in: PAID_STATUSES },
        createdAt: { $gte: monthStart },
      }),

      Booking.countDocuments({
        turf: { $in: turfIds },
        status: { $in: PAID_STATUSES },
        createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd },
      }),

      Booking.countDocuments({
        turf: { $in: turfIds },
        createdAt: { $gte: today },
      }),

      Booking.find({
        turf: { $in: turfIds },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const thisMonthRevenue = thisMonthRevAgg[0]?.total ?? 0;
    const lastMonthRevenue = lastMonthRevAgg[0]?.total ?? 0;
    const totalRevenue = totalRevAgg[0]?.total ?? 0;

    const newBookings = newBookingsDocs.map(b => ({
      id: b.id,
      date: b.date
        ? new Date(b.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '—',
      startTime: b.startTime,
      endTime: b.endTime,
      slotTime: `${b.startTime} – ${b.endTime}`,
      sport: b.sport,
      totalAmount: b.totalAmount,
      status: b.status,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt,
    }));

    return sendSuccess(res, {
      role: 'owner',
      stats: {
        totalTurfs,
        activeTurfs,
        pendingTurfs,
        todayAvailableSlots: todayAvailableSlotsDocs.length,
        todayBookedSlots: todayBookedCount,
        todayTotalSlots: todayTotalCount,
        upcomingBookedCount: upcomingBookedSlots.length,
        thisMonthRevenue,
        lastMonthRevenue,
        totalRevenue,
        revenueTrend: percentChange(thisMonthRevenue, lastMonthRevenue),
        thisMonthBookings: thisMonthBookingCount,
        lastMonthBookings: lastMonthBookingCount,
        bookedTrend: percentChange(thisMonthBookingCount, lastMonthBookingCount),
        newBookingsToday: newBookingsTodayCount,
      },
      turfs,
      quickAvailableSlots, // now contains ALL today's available slots per turf
      upcomingBookedSlots,
      newBookings,
    });

  } catch (error) {
    console.error('[getOwnerDashboard] Error:', error);
    return sendError(res, 500, 'Failed to load owner dashboard.');
  }
};


export const getAdminDashboardData = async (req, res) => {
  try {
    const { today, monthStart, lastMonthStart, lastMonthEnd } = getDateRanges();

    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const thisMonthUsers = await User.countDocuments({ createdAt: { $gte: monthStart } });
    const lastMonthUsers = await User.countDocuments({ createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd } });

    const totalTurfs = await Turf.countDocuments();
    const activeTurfs = await Turf.countDocuments({ isActive: true, status: 'active' });
    const pendingTurfsCount = await Turf.countDocuments({ status: 'pending' });

    const recentPendingTurfs = await Turf.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(6)
      .select('name slug coverImage location.city location.area status createdAt owner')
      .lean();

    const pendingTurfs = recentPendingTurfs.map(t => ({
      id: t._id,
      name: t.name,
      slug: t.slug,
      coverImage: t.coverImage ?? null,
      city: t.location?.city ?? '',
      area: t.location?.area ?? '',
      status: t.status,
      ownerName: 'Owner',
    }));

    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select('firstName lastName email mobile role profileImage createdAt')
      .lean();

    const formattedRecentUsers = recentUsers.map(u => ({
      id: u._id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User',
      email: u.email ?? '—',
      mobile: u.mobile ?? '—',
      role: u.role || 'player',
      profileImage: u.profileImage ?? null,
      createdAt: u.createdAt.toISOString().split('T')[0],
    }));

    const userTrend = percentChange(thisMonthUsers, lastMonthUsers);
    const turfTrend = percentChange(totalTurfs, await Turf.countDocuments({ createdAt: { $lt: monthStart } }));

    return sendSuccess(res, {
      role: 'admin',
      stats: {
        totalUsers,
        newUsersToday,
        thisMonthUsers,
        lastMonthUsers,
        userTrend,
        totalTurfs,
        activeTurfs,
        pendingTurfs: pendingTurfsCount,
        turfTrend,
      },
      pendingTurfs,
      recentUsers: formattedRecentUsers,
    });
  } catch (error) {
    console.error('getAdminDashboardData Error:', error);
    return sendError(res, 500, 'Failed to load admin dashboard.');
  }
};

export const getStaffDashboardData = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { today, tomorrow, next7Days } = getDateRanges();

    const assignedTurfs = await Turf.find({ staff: staffId }).lean();
    const turfIds       = assignedTurfs.map(t => t.id);

    const turfs = assignedTurfs.map(t => ({
      id:           t.id,
      name:         t.name,
      slug:         t.slug,
      coverImage:   t.coverImage  ?? null,
      images:       t.images      ?? [],
      status:       t.status,
      isActive:     t.isActive,
      pricePerSlot: t.pricePerSlot,
      sports:       t.sports      ?? [],
      city:         t.location?.city ?? '',
      area:         t.location?.area ?? '',
    }));

    if (turfIds.length === 0) {
      return sendSuccess(res, {
        role: 'staff',
        stats: {
          assignedTurfs: 0,
          activeTurfs: 0,
          todayAvailableSlots: 0,
          todayBookedSlots: 0,
          todayTotalSlots: 0,
          upcomingBookedCount: 0,
          newBookingsToday: 0,
        },
        turfs: [],
        quickAvailableSlots: [],
        upcomingBookedSlots: [],
        newBookings: [],
      });
    }

    const [
      todayAvailDocs,
      todayBookedCount,
      todayTotalCount,
      upcomingBookedDocs,
      newBookingsToday,
      recentBookingDocs,
    ] = await Promise.all([
      Slot.find({ turf: { $in: turfIds }, date: today, status: 'available' })
        .sort({ startTime: 1 }).limit(6)
        .select('startTime endTime price durationMinutes turf')
        .populate('turf', 'name').lean(),

      Slot.countDocuments({ turf: { $in: turfIds }, date: today, status: { $in: ['booked', 'completed'] } }),

      Slot.countDocuments({ turf: { $in: turfIds }, date: today }),

      Slot.find({
        turf:   { $in: turfIds },
        date:   { $gte: tomorrow, $lte: next7Days },
        status: 'booked',
      })
        .sort({ date: 1, startTime: 1 }).limit(10)
        .populate('turf', 'name slug')
        .populate('bookedBy', 'firstName lastName mobile')
        .lean(),

      Booking.countDocuments({ turf: { $in: turfIds }, createdAt: { $gte: today } }),

      Booking.find({ turf: { $in: turfIds } })
        .sort({ createdAt: -1 }).limit(5)
        .populate('player', 'firstName lastName mobile profileImage')
        .populate('turf', 'name slug')
        .lean(),
    ]);

    const quickAvailableSlots = todayAvailDocs.map(s => ({
      id: s._id,
      turfName:  s.turf?.name ?? 'Turf',
      startTime: s.startTime,
      endTime:   s.endTime,
      price:     s.price,
      duration:  `${s.durationMinutes} mins`,
      status:    'available',
      isBooked:  false,
    }));

    const upcomingBookedSlots = upcomingBookedDocs.map(s => ({
      id:         s._id,
      turfName:   s.turf?.name ?? 'Turf',
      turfSlug:   s.turf?.slug ?? '',
      date:       s.date.toISOString().split('T')[0],
      startTime:  s.startTime,
      endTime:    s.endTime,
      slotTime:   `${s.startTime} – ${s.endTime}`,
      price:      s.price,
      userName:   s.bookedBy
        ? `${s.bookedBy.firstName} ${s.bookedBy.lastName}`.trim()
        : 'Player',
      userMobile: s.bookedBy?.mobile ?? null,
    }));

    const newBookings = recentBookingDocs.map(b => ({
      id:          b.id,
      turfName:    b.turf?.name ?? 'Turf',
      date:        b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—',
      slotTime:    `${b.startTime} – ${b.endTime}`,
      sport:       b.sport,
      totalAmount: b.totalAmount,
      status:      b.status,
      paymentStatus: b.paymentStatus,
      userName:    b.player ? `${b.player.firstName} ${b.player.lastName}`.trim() : 'Player',
      userMobile:  b.player?.mobile ?? null,
      userImage:   b.player?.profileImage ?? null,
      createdAt:   b.createdAt,
    }));

    return sendSuccess(res, {
      role: 'staff',
      stats: {
        assignedTurfs:    assignedTurfs.length,
        activeTurfs:      assignedTurfs.filter(t => t.isActive && t.status === 'active').length,
        todayAvailableSlots: quickAvailableSlots.length,
        todayBookedSlots: todayBookedCount,
        todayTotalSlots:  todayTotalCount,
        upcomingBookedCount: upcomingBookedSlots.length,
        newBookingsToday,
      },
      turfs,
      quickAvailableSlots,
      upcomingBookedSlots,
      newBookings,
    });

  } catch (error) {
    console.error('[getStaffDashboard] Error:', error);
    return sendError(res, 500, 'Failed to load staff dashboard.');
  }
};
