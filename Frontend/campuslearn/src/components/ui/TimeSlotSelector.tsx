import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface TimeSlot {
  day: string;
  times: string[];
}

interface TimeSlotSelectorProps {
  value: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ value, onChange }) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const mergeOverlappingTimes = (times: string[]): string[] => {
    if (times.length === 0) return times;

    const intervals = times.map(time => {
      const [start, end] = time.split('-').map(t => parseInt(t.split(':')[0]));
      return { start, end, original: time };
    }).sort((a, b) => a.start - b.start);

    const merged: Array<{ start: number; end: number }> = [];
    let current = intervals[0];

    for (let i = 1; i < intervals.length; i++) {
      const next = intervals[i];
      if (next.start <= current.end) {
        // Overlapping or adjacent - merge them
        current.end = Math.max(current.end, next.end);
      } else {
        // No overlap - push current and move to next
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);

    return merged.map(interval => `${interval.start.toString().padStart(2, '0')}:00-${interval.end.toString().padStart(2, '0')}:00`);
  };

  const addTimeSlots = () => {
    if (selectedDays.length === 0 || !startTime || !endTime) return;

    const startHour = parseInt(startTime);
    const endHour = parseInt(endTime);

    if (startHour >= endHour) {
      return;
    }

    const timeSlot = `${startTime}:00-${endTime}:00`;

    const updatedSlots = [...value];

    selectedDays.forEach(day => {
      const existingDay = updatedSlots.find(slot => slot.day === day);
      
      if (existingDay) {
        if (!existingDay.times.includes(timeSlot)) {
          const allTimes = [...existingDay.times, timeSlot];
          existingDay.times = mergeOverlappingTimes(allTimes);
        }
      } else {
        updatedSlots.push({ day, times: [timeSlot] });
      }
    });

    onChange(updatedSlots);
    setSelectedDays([]);
    setStartTime('');
    setEndTime('');
  };

  const removeTimeSlot = (day: string, time: string) => {
    const updatedSlots = value
      .map(slot => {
        if (slot.day === day) {
          const newTimes = slot.times.filter(t => t !== time);
          return newTimes.length > 0 ? { ...slot, times: newTimes } : null;
        }
        return slot;
      })
      .filter(Boolean) as TimeSlot[];

    onChange(updatedSlots);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-4">
        <div>
          <Label className="text-sm font-semibold mb-3 block">Select Days</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DAYS.map(day => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={day}
                  checked={selectedDays.includes(day)}
                  onCheckedChange={() => toggleDay(day)}
                />
                <label
                  htmlFor={day}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {day}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger id="start-time">
                <SelectValue placeholder="Select hour" />
              </SelectTrigger>
              <SelectContent>
                {HOURS.map(hour => (
                  <SelectItem key={hour} value={hour}>
                    {hour}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-time">End Time</Label>
            <Select value={endTime} onValueChange={setEndTime}>
              <SelectTrigger id="end-time">
                <SelectValue placeholder="Select hour" />
              </SelectTrigger>
              <SelectContent>
                {HOURS.filter(hour => !startTime || parseInt(hour) > parseInt(startTime)).map(hour => (
                  <SelectItem key={hour} value={hour}>
                    {hour}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={addTimeSlots} 
            disabled={selectedDays.length === 0 || !startTime || !endTime}
            className="w-full"
          >
            Add Availability
          </Button>
        </div>
      </Card>

      {value.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">Selected Availability:</h4>
          <div className="space-y-3">
            {value.map(slot => (
              <div key={slot.day}>
                <p className="text-sm font-medium mb-2">{slot.day}</p>
                <div className="flex flex-wrap gap-2">
                  {slot.times.map(time => (
                    <Badge key={time} variant="secondary" className="gap-1 pr-1">
                      {time}
                      <button
                        onClick={() => removeTimeSlot(slot.day, time)}
                        className="ml-1 hover:bg-destructive/10 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};