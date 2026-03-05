import Slot from '../../features/turf/slot.model.js';
import Turf from '../../features/turf/turf.model.js';
import { sendError, sendSuccess } from '../../utils/errorHandler.js';

const generateSlotsForDay = (turf, targetDate, createdBy) => {
  const slots = [];
  const [openH, openM] = turf.openingTime.split(':').map(Number);
  const [closeH, closeM] = turf.closingTime.split(':').map(Number);

  let current = openH * 60 + openM;
  const endMin = closeH * 60 + closeM;

  while (current + turf.slotDurationMinutes <= endMin) {
    const startH = Math.floor(current / 60);
    const startM = current % 60;
    const endTotal = current + turf.slotDurationMinutes;
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;

    slots.push({
      turf: turf.id,
      date: targetDate,
      startTime: `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`,
      endTime: `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`,
      durationMinutes: turf.slotDurationMinutes,
      price: turf.pricePerSlot,
      status: 'available',
      createdBy,
    });

    current += turf.slotDurationMinutes;
  }

  return slots;
};

export const generateSlots = async (req, res) => {
  try {
    const { turfId } = req.params;
    const { days = 30 } = req.body;

    const turf = await Turf.findOne({ id: turfId });
    if (!turf) return sendError(res, 404, 'Turf not found');

    const allowed = turf.owner === req.user.id || ['admin', 'superadmin'].includes(req.user.role);
    if (!allowed) return sendError(res, 403, 'Not authorized');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let createdCount = 0;

    for (let i = 0; i < days; i++) {
      const target = new Date(today);
      target.setDate(today.getDate() + i);

      const exists = await Slot.exists({ turf: turf.id, date: target });
      if (!exists) {
        const daySlots = generateSlotsForDay(turf, target, req.user.id);
        if (daySlots.length > 0) {
          await Slot.insertMany(daySlots);
          createdCount += daySlots.length;
        }
      }
    }

    return sendSuccess(res, {
      turfId: turf.id,
      daysRequested: days,
      slotsCreated: createdCount,
    }, 'Slots generated');

  } catch (err) {
    console.error(err);
    return sendError(res, 500, 'Slot generation failed');
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { turfId } = req.params;
    let { date } = req.query;

    if (!date) return sendError(res, 400, 'date (YYYY-MM-DD) required');

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const slots = await Slot.find({
      turf: turfId,
      date: targetDate,
      status: 'available',
    })
      .select('id startTime endTime durationMinutes price')
      .sort({ startTime: 1 });

    return sendSuccess(res, { slots, date }, 'Available slots fetched');
  } catch (err) {
    console.error(err);
    return sendError(res, 500, 'Server error');
  }
};

export const getAllSlots = async (req, res) => {
  try {
    const { turfId } = req.params;
    let { date } = req.query;

    if (!date) return sendError(res, 400, 'date (YYYY-MM-DD) required');

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const slots = await Slot.find({
      turf: turfId,
      date: targetDate,
    })
      .select('id startTime endTime durationMinutes price status bookedBy blockedReason')
      .sort({ startTime: 1 });

    return sendSuccess(res, { slots, date }, 'All slots fetched');
  } catch (err) {
    console.error(err);
    return sendError(res, 500, 'Server error');
  }
};


export const blockSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { reason = 'Maintenance / Private booking' } = req.body;

    const slot = await Slot.findOne({ id: slotId });
    if (!slot) return sendError(res, 404, 'Slot not found');

    const turf = await Turf.findOne({ id: slot.turf });
    if (!turf) return sendError(res, 404, 'Turf not found');

    const isOwner = turf.owner === req.user.id;
    const isStaff = turf.staff.includes(req.user.id);
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isStaff && !isAdmin) {
      return sendError(res, 403, 'Only turf owner, assigned staff, or admin can block slots');
    }

    if (slot.status === 'booked') {
      return sendError(res, 400, 'Cannot block a booked slot');
    }

    slot.status = 'blocked';
    slot.blockedReason = reason;
    slot.createdBy = req.user.id; // update who blocked it

    await slot.save();

    return sendSuccess(res, {
      slotId: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      date: slot.date,
      status: slot.status,
      reason: slot.blockedReason,
    }, 'Slot blocked successfully');

  } catch (error) {
    console.error('Block slot error:', error);
    return sendError(res, 500, 'Failed to block slot');
  }
};

export const unblockSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await Slot.findOne({ id: slotId });
    if (!slot) return sendError(res, 404, 'Slot not found');

    const turf = await Turf.findOne({ id: slot.turf });
    if (!turf) return sendError(res, 404, 'Turf not found');

    const isOwner = turf.owner === req.user.id;
    const isStaff = turf.staff.includes(req.user.id);
    const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

    if (!isOwner && !isStaff && !isAdmin) {
      return sendError(res, 403, 'Only turf owner, assigned staff, or admin can unblock slots');
    }

    if (slot.status !== 'blocked') {
      return sendError(res, 400, 'Slot is not blocked');
    }

    slot.status = 'available';
    slot.blockedReason = '';
    slot.createdBy = req.user.id;

    await slot.save();

    return sendSuccess(res, {
      slotId: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      date: slot.date,
      status: slot.status,
    }, 'Slot unblocked successfully');

  } catch (error) {
    console.error('Unblock slot error:', error);
    return sendError(res, 500, 'Failed to unblock slot');
  }
};