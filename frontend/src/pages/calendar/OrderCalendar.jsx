import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { salesApi, purchasesApi } from '../../services/api';
import { useDataRefresh } from '../../context/DataRefreshContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/format';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Package, ShoppingCart, Truck } from 'lucide-react';

export default function OrderCalendar() {
  const { version } = useDataRefresh();
  const { addToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: sales } = useApi(() => salesApi.list(), [version]);
  const { data: purchases } = useApi(() => purchasesApi.list(), [version]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    const salesEvents = (sales?.data || [])
      .filter(s => formatDate(new Date(s.createdAt)) === dateStr)
      .map(s => ({ ...s, type: 'sale', icon: ShoppingCart, color: 'bg-green-500' }));
    const purchaseEvents = (purchases?.data || [])
      .filter(p => p.expectedDate === dateStr)
      .map(p => ({ ...p, type: 'purchase', icon: Truck, color: 'bg-blue-500' }));
    return [...salesEvents, ...purchaseEvents];
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const events = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => events.length > 0 && setSelectedEvent(events[0])}
          className={`p-2 border border-gray-200 dark:border-gray-700 min-h-[80px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isToday ? 'bg-primary/5' : ''}`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>{day}</span>
            {events.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{events.length}</span>
            )}
          </div>
          <div className="space-y-1">
            {events.slice(0, 2).map((event, index) => (
              <div
                key={index}
                className={`text-xs p-1 rounded ${event.color} text-white truncate`}
                title={event.type === 'sale' ? `Sale #${event.id}` : `PO #${event.id}`}
              >
                {event.type === 'sale' ? `Sale #${event.id}` : `PO #${event.id}`}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-gray-500">+{events.length - 2} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    const weekDays = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const events = getEventsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      weekDays.push(
        <div
          key={i}
          className="border border-gray-200 dark:border-gray-700 p-4 min-h-[200px]"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-medium">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
              <p className={`text-sm ${isToday ? 'text-primary' : 'text-gray-500'}`}>{formatDate(date)}</p>
            </div>
            {events.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{events.length}</span>
            )}
          </div>
          <div className="space-y-2">
            {events.map((event, index) => (
              <div
                key={index}
                onClick={() => setSelectedEvent(event)}
                className={`p-2 rounded ${event.color} text-white cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center gap-2">
                  <event.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {event.type === 'sale' ? `Sale #${event.id}` : `PO #${event.id}`}
                  </span>
                </div>
                <p className="text-xs opacity-90">
                  {event.type === 'sale' ? event.customerName : event.supplierName}
                </p>
                <p className="text-xs opacity-90">{formatCurrency(event.total)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return weekDays;
  };

  const renderDayView = () => {
    const events = getEventsForDate(currentDate);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{formatDate(currentDate)}</h3>
          <span className="text-sm text-gray-500">{events.length} events</span>
        </div>
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={index}
                onClick={() => setSelectedEvent(event)}
                className={`p-4 rounded-lg ${event.color} text-white cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <event.icon className="w-6 h-6" />
                    <div>
                      <p className="font-medium">
                        {event.type === 'sale' ? `Sale #${event.id}` : `PO #${event.id}`}
                      </p>
                      <p className="text-sm opacity-90">
                        {event.type === 'sale' ? event.customerName : event.supplierName}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold">{formatCurrency(event.total)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No events for this day</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card title="Order Calendar">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="sm" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold">{getMonthName(currentDate)}</h2>
              <Button variant="secondary" size="sm" onClick={() => navigateMonth(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            </div>
            <Select
              value={view}
              onChange={(e) => setView(e.target.value)}
              options={[
                { value: 'month', label: 'Month' },
                { value: 'week', label: 'Week' },
                { value: 'day', label: 'Day' },
              ]}
              className="w-32"
            />
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-500">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {view === 'month' && (
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          )}

          {view === 'week' && (
            <div className="grid grid-cols-7 gap-1">
              {renderWeekView()}
            </div>
          )}

          {view === 'day' && (
            <div>
              {renderDayView()}
            </div>
          )}

          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Purchases</span>
            </div>
          </div>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Event Details">
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${selectedEvent.color} text-white`}>
                <selectedEvent.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {selectedEvent.type === 'sale' ? `Sale #${selectedEvent.id}` : `Purchase Order #${selectedEvent.id}`}
                </p>
                <Badge variant={selectedEvent.status === 'delivered' || selectedEvent.status === 'received' ? 'success' : 'primary'}>
                  {selectedEvent.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-semibold">{formatCurrency(selectedEvent.total)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {selectedEvent.type === 'sale' ? 'Customer' : 'Supplier'}
                </p>
                <p className="font-semibold">
                  {selectedEvent.type === 'sale' ? selectedEvent.customerName : selectedEvent.supplierName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-semibold">{formatDate(new Date(selectedEvent.createdAt))}</p>
              </div>
              {selectedEvent.expectedDate && (
                <div>
                  <p className="text-sm text-gray-500">Expected</p>
                  <p className="font-semibold">{selectedEvent.expectedDate}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => {
                window.location.href = selectedEvent.type === 'sale' ? `/sales/${selectedEvent.id}` : `/purchases/${selectedEvent.id}`;
              }}>
                View Details
              </Button>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
