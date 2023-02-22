(() => {
	let {
		computed,
		customRef,
		shallowRef,
		watch,
	} = Vue;

	let classes = [
		{
			subject: "TCSS 440 Formal Models in Computer Science (5)",
			description: "Covers languages, finite automata, regular expressions, context-free grammars, and other automata such as pushdown store machines and Turing machines. Includes models of computation, computable and non-computable functions, non-determinism, space and time complexity, tractable and intractable functions, non-determinism, space and time. Prerequisite: a minimum grade of 2.0 in TCSS 342."
		},
		{
			subject: "TCSS 461 Advanced Software Engineering (5)",
			description: "Analyzes system re-engineering, domain-specific languages, generative development, system design and service-oriented architecture. Also covers how to handle legacy systems, utilize model driven software development to automate code generation and understand low to high level architectures, by using software engineering methodologies, refactoring, UML, and the Eclipse framework. Prerequisite: TCSS 360."
		},
		{
			subject: "TCSS 462 Cloud Computing (5)",
			description: "Provides a broad overview of topics associated with cloud computing including fundamental principles, service delivery models, foundational and enabling technologies, architecture, design, and virtualization technology. Understanding and mastery is supported through hands-on tutorials, case studies, and a term project. Prerequisite: a minimum grade of 2.0 in TCSS 360."
		},
		{
			subject: "TCSS 531 Cloud and Virtualization Systems Engineering (5)",
			description: "Provides an introduction to cloud computing and virtualization - enabling multiple instances of operating systems to be run on a single physical system. Concepts include hypervisors, virtual machines, paravirtualization and virtual appliances for design of cloud computing platforms; server and desktop virtualization; storage, network, and application virtualization."
		},
		{
			subject: "TCSS 540 Theory of Computing (5)",
			description: "Covers computational models including finite automata, regular expressions, context-free grammars, pushdown automata, Turing machines, and techniques for analyzing them. Basic computability theory and undecidability, computational complexity theory, and NP-completeness.",
		},
		{
			subject: "TCSS 544 Applied Linear Algebra (5)",
			description: "Examines math concepts on linear algebra and linear transformation, and subjects on singular value decomposition, Fourier transforms, Wavelet transforms, and other topics. Students apply these math concepts and implement numerical solutions to problems in areas including pattern recognition, information retrieval, web search, image processing, cryptography, and machine learning."
		},
		{
			subject: "TCSS 558 Applied Distributed Computing (5)",
			description: "Covers techniques and concepts associated with constructing software that is distributed, reliable, efficient, and extensible; programming multi-threaded applications, communication among objects on different computers, creating a server accessed by multiple clients, using common object design patterns, locating and tailoring components. Not available for elective credit."
		},
		{
			subject: "TCSS 559 Services Computing (5)",
			description: "Covers fundamental concepts in the development of distributed software systems, cloud computing and service delivery models and the Service-Oriented Architecture (SOA). Topics include, but are not limited to, Simple Object Access Protocol (SOAP) and Representational State Transfer (REST) service development, microservices, SOA design patterns, service coordination protocol, service composition and performance management."
		},
		{
			subject: "TCSS 562 Software Engineering for Cloud Computing (5)",
			description: "Presents the principles of software engineering including: requirements analysis, design and prototyping, system analysis, testing, project management, software metrics, processes and lifecycles including Agile and DevOps in the context of the design and development of a distributed cloud based application."
		}
	];

	new Vue({
		el: '#App',
		vuetify: new Vuetify(),
		setup() {
			let createStep = ((instance) => {
				let candidates = instance.getCandidates();
				return {
					instance,
					candidates,
					first: null,
					last: null,
				};
			});
			let createSteps = (() => {
				let instance = MaxDiff(_.shuffle(classes));
				return [createStep(instance)];
			});
			let stepsRef = shallowRef(createSteps());
			let restart = (() => {
				stepsRef.value = createSteps();
			});
			let currStepIndexRef = computed(() => {
				let steps = stepsRef.value;
				return steps.length - 1;
			});
			let currStepRef = computed(() => {
				let array = stepsRef.value;
				let index = currStepIndexRef.value;
				return array[index];
			});
			let currMaxDiffInstanceRef = computed(() => currStepRef.value.instance);
			let classesRef = computed(() => currStepRef.value.candidates);
			let coolClassRef = customRef((track, trigger) => {
				return {
					get() {
						track();
						return currStepRef.value.first;
					},
					set(value) {
						let step = currStepRef.value;
						if (step.first !== value) {
							step.first = value;
							trigger();
						}
					},
				};
			});
			let lameClassRef = customRef((track, trigger) => {
				return {
					get() {
						track();
						return currStepRef.value.last;
					},
					set(value) {
						let step = currStepRef.value;
						if (step.last !== value) {
							step.last = value;
							trigger();
						}
					},
				};
			});
			watch(coolClassRef, (coolClass) => {
				if (coolClass) {
					let classes = classesRef.value;
					if (classes.length === 2) {
						lameClassRef.value = _.without(classes, coolClass)[0];
					}
				}
			});
			watch(lameClassRef, (lameClass) => {
				if (lameClass) {
					let classes = classesRef.value;
					if (classes.length === 2) {
						coolClassRef.value = _.without(classes, lameClass)[0];
					}
				}
			});
			let goToPrevStepRef = computed(() => {
				let steps = stepsRef.value;
				if (steps.length > 1) {
					return (() => {
						steps.pop();
						stepsRef.value = steps;
					});
				}
			});
			let goToNextStepRef = computed(() => {
				let coolClass = coolClassRef.value;
				let lameClass = lameClassRef.value;
				if (coolClass && lameClass && coolClass !== lameClass) {
					return (() => {
						let instance = currMaxDiffInstanceRef.value;
						instance = instance.clone();
						instance.order(coolClass, lameClass);
						let classes = classesRef.value;
						classes.forEach((subject) => {
							if (subject !== coolClass && subject !== lameClass) {
								instance.order(coolClass, subject, lameClass);
							}
						});
						let steps = stepsRef.value;
						stepsRef.value = [...steps, createStep(instance)];
					});
				}
			});
			let goesForwardRef = shallowRef(true);
			watch(currStepIndexRef, (currStepIndex, prevStepIndex) => {
				goesForwardRef.value = currStepIndex > prevStepIndex;
			});
			return {
				currStepIndex: currStepIndexRef,
				goesForward: goesForwardRef,
				complete: computed(() => currMaxDiffInstanceRef.value.complete),
				progress: computed(() => currMaxDiffInstanceRef.value.progress),
				result: computed(() => currMaxDiffInstanceRef.value.result),
				intermediateResult: computed(() => currMaxDiffInstanceRef.value.getOrderedGroups()),
				showIntermediateResult: shallowRef(false),
				classes: classesRef,
				coolClass: coolClassRef,
				lameClass: lameClassRef,
				goToNextStep: goToNextStepRef,
				goToPrevStep: goToPrevStepRef,
				restart,
			};
		},
	});
})();
