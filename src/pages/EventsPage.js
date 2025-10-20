import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import events from '../data/mockEvents.json';
import './EventsPage.css';

const EventsPage = () => {
  const [activeDate, setActiveDate] = useState(new Date());

  const filteredEvents = useMemo(() => {
    // Create a YYYY-MM string from the active date for robust comparison
    const selectedYearMonth = `${activeDate.getFullYear()}-${(activeDate.getMonth() + 1).toString().padStart(2, '0')}`;

    return events.filter(event => {
      if (!event.startDate) return false;
      // Compare using startsWith on the date string to avoid timezone issues
      return event.startDate.startsWith(selectedYearMonth);
    });
  }, [activeDate]);

  return (
    <div className="events-page">
      <h1>大会情報</h1>
      <div className="calendar-container">
        <Calendar
          value={activeDate}
          view="month"
          onActiveStartDateChange={({ activeStartDate }) => setActiveDate(activeStartDate)}
          locale="ja-JP"
        />
      </div>
      <h2 className="events-list-title">{`${activeDate.getFullYear()}年${activeDate.getMonth() + 1}月`}の大会</h2>
      <div className="events-list">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <h2>{event.name}</h2>
              <p><strong>開催日:</strong> {event.dateText}</p>
              <p><strong>場所:</strong> {event.location}</p>
            </div>
          ))
        ) : (
          <p>選択された月の大会情報はありません。</p>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
