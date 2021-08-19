package org.egov.filters.pre;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;

public class CorrelationIdFilterTest {

	private CorrelationIdFilter correlationIdFilter;

	@Before
	public void before() {
		correlationIdFilter = new CorrelationIdFilter();
	}

	@Test
	public void test_should_set_filter_order_to_beginning() {
		assertEquals(0, correlationIdFilter.filterOrder());
	}

	@Test
	public void test_should_execute_as_pre_filter() {
		assertEquals("pre", correlationIdFilter.filterType());
	}

	@Test
	public void test_should_always_execute_filter() {
		assertTrue( correlationIdFilter.shouldFilter());
	}

}