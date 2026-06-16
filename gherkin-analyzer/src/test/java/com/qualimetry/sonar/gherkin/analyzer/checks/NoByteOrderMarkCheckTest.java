/*
 * Copyright 2026 SHAZAM Analytics Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.qualimetry.sonar.gherkin.analyzer.checks;

import com.qualimetry.sonar.gherkin.analyzer.testing.CheckVerifier;
import org.junit.jupiter.api.Test;

class NoByteOrderMarkCheckTest {

    @Test
    void shouldNotRaiseIssueWhenNoBomPresent() {
        CheckVerifier.verifyNoIssues(
                new NoByteOrderMarkCheck(),
                "checks/no-byte-order-mark/compliant.feature");
    }

    @Test
    void shouldRaiseIssueWhenBomPresent() {
        // The fixture's first bytes are a real UTF-8 BOM (EF BB BF); the
        // @L1 annotation asserts the issue on line 1.
        CheckVerifier.verify(
                new NoByteOrderMarkCheck(),
                "checks/no-byte-order-mark/noncompliant.feature");
    }
}
