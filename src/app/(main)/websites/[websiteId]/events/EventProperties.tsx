import { GridColumn, GridTable } from 'react-basics';
import { useEventDataProperties, useEventDataValues, useMessages } from '@/components/hooks';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useState, useMemo } from 'react';
import { CHART_COLORS } from '@/lib/constants';
import styles from './EventProperties.module.css';
import PieChart from '@/components/charts/PieChart';

export function EventProperties({ websiteId }: { websiteId: string }) {
  const [propertyName, setPropertyName] = useState('');
  const [eventName, setEventName] = useState('');
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetched, error } = useEventDataProperties(websiteId);
  const { data: values } = useEventDataValues(websiteId, eventName, propertyName);

  const chartData =
    propertyName && values
      ? {
          labels: values.map(({ value }) => value),
          datasets: [
            {
              data: values.map(({ total }) => total),
              backgroundColor: CHART_COLORS,
              borderWidth: 0,
            },
          ],
        }
      : null;

  // Process data specifically for A/B testing if viewing the right event and property
  const averageTimeSpent = useMemo(() => {
    if (
      eventName === 'itinerary-time-spent' &&
      (propertyName === 'itineraryListVariantA' || propertyName === 'itineraryListVariantB') &&
      values
    ) {
      return values.length > 0
        ? values.reduce((sum, item) => sum + item.value * item.total, 0) / values.length
        : 0;
    }
    return null;
  }, [eventName, propertyName, values]);

  const handleRowClick = row => {
    setEventName(row.eventName);
    setPropertyName(row.propertyName);
  };

  return (
    <LoadingPanel isLoading={isLoading} isFetched={isFetched} data={data} error={error}>
      <div className={styles.container}>
        <GridTable data={data} cardMode={false} className={styles.table}>
          <GridColumn name="eventName" label={formatMessage(labels.name)}>
            {row => (
              <div className={styles.link} onClick={() => handleRowClick(row)}>
                {row.eventName}
              </div>
            )}
          </GridColumn>
          <GridColumn name="propertyName" label={formatMessage(labels.property)}>
            {row => (
              <div className={styles.link} onClick={() => handleRowClick(row)}>
                {row.propertyName}
              </div>
            )}
          </GridColumn>
          <GridColumn name="total" label={formatMessage(labels.count)} alignment="end" />
        </GridTable>
        {propertyName && (
          <div className={styles.chart}>
            <div className={styles.title}>
              {eventName === 'itinerary-time-spent' &&
              (propertyName === 'itineraryListVariantA' || propertyName === 'itineraryListVariantB')
                ? 'A/B Testing - Average Time Spent'
                : propertyName}
            </div>
            {eventName === 'itinerary-time-spent' &&
            (propertyName === 'itineraryListVariantA' ||
              propertyName === 'itineraryListVariantB') ? (
              <div>
                <h2>
                  Average Time:{' '}
                  {averageTimeSpent !== null ? `${averageTimeSpent.toFixed(2)} seconds` : 'No data'}
                </h2>
              </div>
            ) : (
              <PieChart key={propertyName + eventName} type="doughnut" data={chartData} />
            )}
          </div>
        )}
      </div>
    </LoadingPanel>
  );
}

export default EventProperties;
